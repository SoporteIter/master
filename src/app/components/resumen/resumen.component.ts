import { Component, OnInit } from '@angular/core';
import { ParseService } from '../../services/parse.service';
import { SessionRouterService } from '../../services/session-router.service';

@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.css']
})
export class ResumenComponent implements OnInit {
    public date: any;
    public viajes: any;
    public numViajes: number;
    public calidad: number;
    public ganancia: number;
    public incidentes: number;

    constructor(
        private _parseService: ParseService,
        private _sessionRouterService: SessionRouterService
    ) { }

    ngOnInit(): void {
        // console.log("ResumenComponent running");
        this._sessionRouterService.sessionRouter('Resumen');
        this.date = new Date();
        this.createViajesData(this.date);
    }

    ngOnDestroy(): void {
        // console.log('ResumenComponent destroying');
    }

    public changeDate(op: number): void {
        switch (op) {
            case 0:
                this.date.setDate(this.date.getDate() - 1);
                this.createViajesData(this.date);
                break;

            case 1:
                this.date.setDate(this.date.getDate() + 1);
                this.createViajesData(this.date);
                break;

            case 2:
                this.date = new Date();
                this.createViajesData(this.date);
                break;
        }
    }

    private createViajesData(date: any): void {
        date.setHours(0, 0, 0, 0);
        let greaterThanOrEqualToDate = new Date(date);
        date.setDate(date.getDate() + 1);
        let lessThanDate = new Date(date);
        date.setDate(date.getDate() - 1);

        let queryParams = {
            className: 'Viaje',
            constraints: {
                greaterThanOrEqualTo: {
                    createdAt: greaterThanOrEqualToDate
                },
                lessThan: {
                    createdAt: lessThanDate
                },
                exists: ['asignacion', 'puntoInicial', 'status', 'pasajero'],
                descending: "createdAt",
                include: ['pasajero', 'asignacion.chofer.iterMercado', 'asignacion.vehiculo.tipoServicio'],
                limit: 1000
            },
            search: 'find'
        };
        this._parseService.query(queryParams).then((response: any) => {
            if (response[0]) {
                this.viajes = JSON.parse(JSON.stringify(response[1]));
                this.numViajes = 0;
                let sumaCalificaciones = 0;
                let numViajesCalificados = 0;
                this.ganancia = 0;
                for (let i = 0; i < this.viajes.length; i++) {
                    if (!(this.viajes[i].driverRate == undefined)) {
                        sumaCalificaciones += this.viajes[i].driverRate;
                        numViajesCalificados++;
                    }
                    if (!(this.viajes[i].tripTotalAmount == undefined)) {
                        this.ganancia += this.viajes[i].tripTotalAmount;
                    }
                    if (this.viajes[i].status == 2) {
                        this.numViajes++;
                    }
                }
                this.calidad = sumaCalificaciones / numViajesCalificados;
                this.incidentes = 0;
            } else {
                this.viajes = [];
                this.numViajes = 0;
                this.ganancia = 0;
                this.calidad = 0;
                this.incidentes = 0;
            }
        });
    }
}
