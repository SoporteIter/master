import { Component, OnInit } from '@angular/core';
import { ParseService } from '../../services/parse.service';
import { NotificationService } from '../../services/notification.service';
import { SessionRouterService } from '../../services/session-router.service';

@Component({
  selector: 'app-tarifa',
  templateUrl: './tarifa.component.html',
  styleUrls: ['./tarifa.component.css']
})
export class TarifaComponent implements OnInit {
    public tarifas: any;
    public changedInput: boolean[];
    public tarifaClicked: string[];

    constructor(
        private _parseService: ParseService,
        private _notificationService: NotificationService,
        private _sessionRouterService: SessionRouterService
    ) { }

    ngOnInit(): void {
        // console.log("TarifaComponent running");
        this._sessionRouterService.sessionRouter('Tarifa');
        this.changedInput = [];
        this.createTarifaData();
    }

    ngOnDestroy(): void {
        // console.log('TarifaComponent destroying');
    }

    private createTarifaData(): void {
        let queryParams = { className: 'Tarifa', constraints: { limit: 1000 }, search: 'find' };
        this._parseService.query(queryParams).then((response: any) => {
            if (response[0]) {
                this.tarifas = JSON.parse(JSON.stringify(response[1]));
            }
        });
    }

    public saveChanges(tarifaClicked: string[]): void {
        let queryParams = { className: 'Tarifa', constraints: { equalTo: { nombre: tarifaClicked[0] } }, search: 'first' };
        this._parseService.query(queryParams).then((result: any) => {
            if (result[0]) {
                let saveParams = {
                    type: 'Object', option: 'edit', object: result[1], data: {
                        banderazo: tarifaClicked[1],
                        kilometro: tarifaClicked[2],
                        minuto: tarifaClicked[3]
                    }
                };
                this._parseService.saveObject(saveParams).then((result: any) => {
                    if (result[0]) {
                        this._notificationService.onSuccess('La tarifa: ' + tarifaClicked[0] + ' se salvo correctamente!', 100000, 'glyphicon glyphicon-floppy-saved');
                    }
                });
            }
        });
    }

    public onCancel(tipoTarifa: string): void {
        this._notificationService.onWarning('La tarifa: ' + tipoTarifa + ' no se salvo!', 100000);
        this.createTarifaData();
    }
}
