import { Component, OnInit } from '@angular/core';
import { ParseService } from '../../services/parse.service';
import { NotificationService } from '../../services/notification.service';
import { SessionRouterService } from '../../services/session-router.service';
import { GridOptions } from 'ag-grid/main';
import { DriverForm, VehicleForm, Asignacion } from '../../classes/form';
declare var moment: any;
declare var $: any;

@Component({
  selector: 'app-activos',
  templateUrl: './activos.component.html',
  styleUrls: ['./activos.component.css']
})
export class ActivosComponent implements OnInit {
    public activosGridOptions: GridOptions;
    public activosRowData: any[];
    public activosColumnDefs: any[];
    public activosRowCount: string;
    private asignacionGridOptions: GridOptions;
    private asignacionRowData: any[];
    private asignacionColumnDefs: any[];
    private asignacionRowCount: string;

    public selectedActivo: string;
    private objectSelected: any;

    public activeForm: boolean;
    private activeIdCard: boolean;
    public activeAsignacion: boolean;
    private activeAssign: boolean;
    private loadingSave: boolean;
    private loadingErase: boolean;
    private loadingResetPass: boolean;
    private optionChosen: number;

    private modelDriver: DriverForm;
    private modelVehicle: VehicleForm;
    private asignacion: Asignacion;
    private vehicleAssigned: boolean;
    private photo: boolean;
    private mercados: any;
    private servicios: any;
    private photoChanged: boolean;

    constructor(
        private _parseService: ParseService,
        private _notificationService: NotificationService,
        private _sessionRouterService: SessionRouterService
    ) { }

    ngOnInit(): void {
        // console.log("ActivosComponent running");
        this._sessionRouterService.sessionRouter('Activos');
        this.selectedActivo = 'Chofer';
        this.activosGridOptions = <GridOptions>{};
        this.asignacionGridOptions = <GridOptions>{};
        this.activosGridOptions.rowHeight = 30;
        this.createRowData(this.selectedActivo);
        this.createColumnDefs(this.selectedActivo);
    }

    ngOnDestroy(): void {
        // console.log('ActivosComponent destroying');
    }

    public onSelect(activo: string): void {
        this.selectedActivo = activo;
        this.createRowData(activo);
        this.createColumnDefs(activo);
        this.activeForm = false;
    }

    private createRowData(collection: string): void {
        let queryParams: Object;
        switch (collection) {
            case 'Chofer':
                queryParams = { className: collection, constraints: { equalTo: { deleted: false }, include: ['iterMercado'], limit: 1000 }, search: 'find' };
                break;

            case 'Vehiculo':
                queryParams = { className: collection, constraints: { equalTo: { deleted: false }, include: ['tipoServicio'], limit: 1000 }, search: 'find' };
                break;
        }
        this._parseService.query(queryParams).then((result: any) => {
            if (result[0]) {
                this.activosRowData = JSON.parse(JSON.stringify(result[1]));
                // console.log(this.activosRowData);
            } else {
                this.activosRowData = [];
            }
        });
    }

    private createColumnDefs(collection: string): void {
        let self = this;
        switch (collection) {
            case 'Chofer':
                this.activosColumnDefs = [
                    {
                        headerName: "Estatus", field: "status", width: 80,
                        cellStyle: function(params: any) {
                            if (params.data.status == 0) {
                                return { color: 'white', backgroundColor: 'red', 'font-size': 15 };
                            } else if (params.data.status == 1) {
                                return { color: 'white', backgroundColor: 'green', 'font-size': 15 };
                            }
                        },
                        cellRenderer: function(params: any) {
                            if (params.data.status == 0) {
                                return 'Inactivo';
                            } else if (params.data.status == 1) {
                                return 'Activo';
                            }
                        }
                    },
                    {
                        headerName: "Asignación", field: "asignacion", width: 100,
                        cellRenderer: function(params: any) {
                            let eDiv = document.createElement('div');
                            eDiv.innerHTML = '<button class="btn-primary btn-xs">Asignación</button>';
                            eDiv.querySelectorAll('.btn-primary')[0].addEventListener('click', function(mouseEvent: any) {
                                // console.log('button was clicked!!', mouseEvent, params);
                                self.vehicleAssigned = false;
                                self.activeAssign = false;
                                self.activeAsignacion = false;
                                $('#modalAsignacion').modal('show');

                                let queryParams = { className: 'Chofer', objectId: params.data.objectId, search: 'get' };
                                self._parseService.query(queryParams).then((choferResponse: any) => {
                                    if (choferResponse[0]) {
                                        let queryParams = { className: 'choferPhoto', constraints: { equalTo: { chofer: choferResponse[1] } }, search: 'first' };
                                        self._parseService.query(queryParams).then((choferPhotoResponse: any) => {
                                            if (!('message' in choferPhotoResponse[1])) {
                                                let driverPhoto: string;
                                                if (choferPhotoResponse[0]) {
                                                    driverPhoto = choferPhotoResponse[1].get('photo').url();
                                                } else {
                                                    driverPhoto = '';
                                                }
                                                let queryParams = { className: 'Asignacion', constraints: { equalTo: { chofer: choferResponse[1] }, include: 'vehiculo' }, search: 'first' };
                                                self._parseService.query(queryParams).then((asignacionResponse: any) => {
                                                    if (!('message' in asignacionResponse[1])) {
                                                        if (asignacionResponse[0]) {
                                                            let queryParams = { className: 'vehiculoPhoto', constraints: { equalTo: { vehiculo: asignacionResponse[1].get('vehiculo') } }, search: 'first' };
                                                            self._parseService.query(queryParams).then((vehiculoPhotoResponse: any) => {
                                                                if (!('message' in vehiculoPhotoResponse[1])) {
                                                                    let vehiclePhoto: string;
                                                                    if (vehiculoPhotoResponse[0]) {
                                                                        vehiclePhoto = vehiculoPhotoResponse[1].get('photo').url();
                                                                    } else {
                                                                        vehiclePhoto = '';
                                                                    }

                                                                    let driverTipoServicio: string;
                                                                    if (asignacionResponse[1].get('vehiculo').get('tipoServicio')) {
                                                                        driverTipoServicio = asignacionResponse[1].get('vehiculo').get('tipoServicio').get('nombre');
                                                                    } else {
                                                                        driverTipoServicio = '';
                                                                    }

                                                                    self.asignacion = new Asignacion(
                                                                        asignacionResponse[1].id,
                                                                        params.data.objectId,
                                                                        driverPhoto,
                                                                        params.data.nombre + ' ' + params.data.apellidos,
                                                                        params.data.iterMercado.nombre,
                                                                        params.data.telCelular,
                                                                        params.data.userRatingAvg,
                                                                        vehiclePhoto,
                                                                        asignacionResponse[1].get('vehiculo').get('modelo'),
                                                                        asignacionResponse[1].get('vehiculo').get('color'),
                                                                        asignacionResponse[1].get('vehiculo').get('placa'),
                                                                        driverTipoServicio,
                                                                        asignacionResponse[1].get('vehiculo').get('flota')
                                                                    );
                                                                    self.vehicleAssigned = true;
                                                                    self.activeAsignacion = true;
                                                                } else {
                                                                    $('#modalAsignacion').modal('hide');
                                                                    self._notificationService.onError(vehiculoPhotoResponse[1].message, 100000);
                                                                }
                                                            });
                                                        } else {
                                                            self.asignacion = new Asignacion(
                                                                '',
                                                                params.data.objectId,
                                                                driverPhoto,
                                                                params.data.nombre + ' ' + params.data.apellidos,
                                                                params.data.iterMercado.nombre,
                                                                params.data.telCelular,
                                                                params.data.userRatingAvg,
                                                                '',
                                                                '',
                                                                '',
                                                                '',
                                                                '',
                                                                ''
                                                            );
                                                            self.vehicleAssigned = false;
                                                            self.activeAsignacion = true;
                                                        }
                                                    } else {
                                                        $('#modalAsignacion').modal('hide');
                                                        self._notificationService.onError(asignacionResponse[1].message, 100000);
                                                    }
                                                });
                                            } else {
                                                $('#modalAsignacion').modal('hide');
                                                self._notificationService.onError(choferPhotoResponse[1].message, 100000);
                                            }
                                        });
                                    } else {
                                        $('#modalAsignacion').modal('hide');
                                        if ('message' in choferResponse[1]) {
                                            self._notificationService.onError(choferResponse[1].message, 100000);
                                        } else {
                                            self._notificationService.onError('No se encontró chofer, intenta de nuevo por favor.', 100000);
                                        }
                                    }
                                });
                            });
                            return eDiv;
                        }, cellStyle: { "text-align": "center" }
                    },
                    { headerName: "Nombre", field: "nombre", width: 150, cellStyle: { 'font-size': 15 } },
                    { headerName: "Apellidos", field: "apellidos", width: 150, cellStyle: { 'font-size': 15 } },
                    { headerName: "Ciudad", field: "ciudad", width: 150, cellStyle: { 'font-size': 15 } },
                    { headerName: "Iter mercado", field: "iterMercado.nombre", width: 150, cellStyle: { 'font-size': 15 } },
                    { headerName: "Total de viajes", field: "totalTrips", width: 150, cellStyle: { 'font-size': 15 } },
                    { headerName: "Calificación", field: "userRatingAvg", width: 150, cellStyle: { 'font-size': 15 } },
                    { headerName: "Tel cel", field: "telCelular", width: 150, cellStyle: { 'font-size': 15 } },
                    { headerName: "Tel casa", field: "telCasa", width: 150, cellStyle: { 'font-size': 15 } },
                    { headerName: "Codigo Postal", field: "codigoPostal", width: 150, cellStyle: { 'font-size': 15 } },
                    {
                        headerName: "Fecha de nacimiento", field: "fechaNacimiento.iso", width: 150, cellStyle: { 'font-size': 15 },
                        cellRenderer: function(params: any) {
                            if ('fechaNacimiento' in params.data) {
                                return moment(params.data.fechaNacimiento.iso).locale('es').format('LL');
                            } else {
                                return '';
                            }
                        }
                    },
                    { headerName: "Email", field: "email", width: 150, cellStyle: { 'font-size': 15 } },
                    { headerName: "Direccion", field: "direccion", width: 150, cellStyle: { 'font-size': 15 } },
                    {
                        headerName: "Fecha de vencimiento de licencia", field: "fechaVencimientoLicencia.iso", width: 150, cellStyle: { 'font-size': 15 },
                        cellRenderer: function(params: any) {
                            if ('fechaVencimientoLicencia' in params.data) {
                                return moment(params.data.fechaVencimientoLicencia.iso).locale('es').format('LL');
                            } else {
                                return '';
                            }
                        }
                    }
                ];
                break;

            case 'Vehiculo':
                this.activosColumnDefs = [
                    {
                        headerName: "Estatus", field: "status", width: 80,
                        cellStyle: function(params: any) {
                            if (params.data.status == 0) {
                                return { color: 'white', backgroundColor: 'red', 'font-size': 15 };
                            } else if (params.data.status == 1) {
                                return { color: 'white', backgroundColor: 'green', 'font-size': 15 };
                            }
                        },
                        cellRenderer: function(params: any) {
                            if (params.data.status == 0) {
                                return 'Inactivo';
                            } else if (params.data.status == 1) {
                                return 'Activo';
                            }
                        }
                    },
                    { headerName: "Placa", field: "placa", width: 150, cellStyle: { 'font-size': 15 } },
                    { headerName: "Numero Serie", field: "numeroSerie", width: 150, cellStyle: { 'font-size': 15 } },
                    { headerName: "Modelo", field: "modelo", width: 150, cellStyle: { 'font-size': 15 } },
                    { headerName: "Tipo Servicio", field: "tipoServicio.nombre", width: 150, cellStyle: { 'font-size': 15 } },
                    {
                        headerName: "Fecha Registro", field: "fechaRegistro.iso", width: 150, cellStyle: { 'font-size': 15 },
                        cellRenderer: function(params: any) {
                            if ('fechaRegistro' in params.data) {
                                return moment(params.data.fechaRegistro.iso).locale('es').format('LL');
                            } else {
                                return '';
                            }
                        }
                    },
                    { headerName: "Marca", field: "marca", width: 150, cellStyle: { 'font-size': 15 } },
                    { headerName: "Flota", field: "flota", width: 150, cellStyle: { 'font-size': 15 } },
                    { headerName: "Color", field: "color", width: 150, cellStyle: { 'font-size': 15 } },
                    { headerName: "Id GPS", field: "idGPS", width: 150, cellStyle: { 'font-size': 15 } },
                    { headerName: "Tipo", field: "tipo", width: 150, cellStyle: { 'font-size': 15 } },
                    { headerName: "Licencia", field: "licencia", width: 150, cellStyle: { 'font-size': 15 } },
                    { headerName: "Numero Lugares", field: "numeroLugares", width: 150, cellStyle: { 'font-size': 15 } }
                ];
                break;

            default:
                this.activosColumnDefs = [];
                break;
        }
    }

    private calculateRowCount(): void {
        if (this.activosGridOptions.api && this.activosRowData) {
            let model = this.activosGridOptions.api.getModel();
            let totalRows = this.activosRowData.length;
            let processedRows = model.getRowCount();
            this.activosRowCount = processedRows.toLocaleString() + ' / ' + totalRows.toLocaleString();
        }
        if (this.asignacionGridOptions.api && this.asignacionRowData) {
            let model = this.asignacionGridOptions.api.getModel();
            let totalRows = this.asignacionRowData.length;
            let processedRows = model.getRowCount();
            this.asignacionRowCount = processedRows.toLocaleString() + ' / ' + totalRows.toLocaleString();
        }
    }

    public onModelUpdated(): void {
        console.log('onModelUpdated');
        this.calculateRowCount();
    }

    public onRowClicked($event: any): void {
        // console.log('onRowClicked: ', $event.node.data);
        this.objectSelected = $event.node.data;
    }

    public onRowDoubleClicked($event: any): void {
        // console.log('onRowDoubleClicked: ', $event.node.data);
        this.modelForm(1, $event.node.data);
    }

    public onQuickFilterChanged(grid: number, $event: any): void {
        switch (grid) {
            case 0:
                this.activosGridOptions.api.setQuickFilter($event.target.value);
                break;

            case 1:
                this.asignacionGridOptions.api.setQuickFilter($event.target.value);
                break;
        }
    }

    public modelForm(option: number, data?: any, activo?: string): void {
        if (activo && this.selectedActivo != activo) {
            this.onSelect(activo);
        } else {
            this.activeForm = false;
        }
        let queryParams: Object;
        this.loadingSave = false;
        this.loadingErase = false;
        this.photo = true;
        this.photoChanged = false;
        this.optionChosen = option;
        $('#modalForm').modal('show');

        switch (this.selectedActivo) {
            case 'Chofer':
                this.loadingResetPass = false;
                queryParams = { className: 'IterMercados', constraints: { limit: 100 }, search: 'find' };
                this._parseService.query(queryParams).then((iterMercadoResponse: any) => {
                    if (iterMercadoResponse[0]) {
                        this.mercados = iterMercadoResponse[1];
                        if (option == 0) {
                            this.modelDriver = new DriverForm('', '', '', 0, '', '', '', '', '', '', '', '', '');
                            this.activeForm = true;
                            setTimeout(function() {
                                $('#fileInput').css({ 'border-left': '5px solid #a94442' });
                            }, 0);

                        } else if (option == 1) {
                            let fechaNacimientoString: string;
                            let fechaVencimientoLicenciaString: string;
                            if (data.fechaNacimiento) {
                                let date = new Date(data.fechaNacimiento.iso);
                                let day = ("0" + date.getDate()).slice(-2);
                                let month = ("0" + (date.getMonth() + 1)).slice(-2);
                                fechaNacimientoString = date.getFullYear() + "-" + (month) + "-" + (day);
                            } else {
                                fechaNacimientoString = '';
                            }

                            if (data.fechaVencimientoLicencia) {
                                let date = new Date(data.fechaVencimientoLicencia.iso);
                                let day = ("0" + date.getDate()).slice(-2);
                                let month = ("0" + (date.getMonth() + 1)).slice(-2);
                                fechaVencimientoLicenciaString = date.getFullYear() + "-" + (month) + "-" + (day);
                            } else {
                                fechaVencimientoLicenciaString = '';
                            }

                            let queryParams = { className: 'Chofer', objectId: data.objectId, search: 'get' };
                            this._parseService.query(queryParams).then((choferResponse: any) => {
                                if (choferResponse[0]) {
                                    let queryParams = { className: 'choferPhoto', constraints: { equalTo: { chofer: choferResponse[1] } }, search: 'first' };
                                    this._parseService.query(queryParams).then((choferPhotoResponse: any) => {
                                        if (!('message' in choferPhotoResponse[1])) {
                                            let file: string;
                                            if (choferPhotoResponse[0]) {
                                                file = choferPhotoResponse[1].get('photo').url();
                                            } else {
                                                file = '';
                                            }

                                            let mercado: string;
                                            if (data.iterMercado && data.iterMercado.nombre) {
                                                for (let i = 0; i < iterMercadoResponse[1].length; i++) {
                                                    if (data.iterMercado.nombre === iterMercadoResponse[1][i].get('nombre')) {
                                                        mercado = iterMercadoResponse[1][i];
                                                        break;
                                                    }
                                                }
                                            } else {
                                                mercado = '';
                                            }

                                            this.modelDriver = new DriverForm(
                                                file,
                                                data.nombre,
                                                data.apellidos,
                                                data.status,
                                                data.ciudad,
                                                data.codigoPostal,
                                                fechaNacimientoString,
                                                data.email,
                                                data.direccion,
                                                fechaVencimientoLicenciaString,
                                                data.telCelular,
                                                data.telCasa,
                                                mercado,
                                                data.objectId
                                            );

                                            this.activeForm = true;
                                            setTimeout(function() {
                                                if (choferPhotoResponse[0]) {
                                                    $('#fileInput').css({ 'border-left': '5px solid #42A948' });
                                                } else {
                                                    $('#fileInput').css({ 'border-left': '5px solid #a94442' });
                                                }
                                            }, 0);
                                        } else {
                                            $('#modalForm').modal('hide');
                                            this._notificationService.onError(choferPhotoResponse[1].message, 100000);
                                        }
                                    });
                                } else {
                                    $('#modalForm').modal('hide');
                                    if ('message' in choferResponse[1]) {
                                        this._notificationService.onError(choferResponse[1].message, 100000);
                                    } else {
                                        this._notificationService.onError('No se encontró chofer, intenta de nuevo por favor.', 100000);
                                    }
                                }
                            });
                        }
                    } else {
                        $('#modalForm').modal('hide');
                        if ('message' in iterMercadoResponse[1]) {
                            this._notificationService.onError(iterMercadoResponse[1].message, 100000);
                        } else {
                            this._notificationService.onError('No se encontró mercado, intenta de nuevo por favor.', 100000);
                        }
                    }
                });
                break;

            case 'Vehiculo':
                queryParams = { className: 'IterTipoServicio', constraints: { limit: 100 }, search: 'find' };
                this._parseService.query(queryParams).then((iterTipoServicioResponse: any) => {
                    if (iterTipoServicioResponse[0]) {
                        this.servicios = iterTipoServicioResponse[1];
                        if (option == 0) {
                            this.modelVehicle = new VehicleForm('', '', '', '', '', '', '', '', '', '', 0, '', '', '');
                            this.activeForm = true;
                            setTimeout(function() {
                                $('#fileInput').css({ 'border-left': '5px solid #a94442' });
                            }, 0);
                        } else if (option == 1) {
                            let fechaRegistroString: string;
                            if (data.fechaRegistro) {
                                let date = new Date(data.fechaRegistro.iso);
                                let day = ("0" + date.getDate()).slice(-2);
                                let month = ("0" + (date.getMonth() + 1)).slice(-2);
                                fechaRegistroString = date.getFullYear() + "-" + (month) + "-" + (day);
                            } else {
                                fechaRegistroString = '';
                            }

                            let queryParams = { className: 'Vehiculo', objectId: data.objectId, search: 'get' };
                            this._parseService.query(queryParams).then((vehicleResponse: any) => {
                                if (vehicleResponse[0]) {
                                    let queryParams = { className: 'vehiculoPhoto', constraints: { equalTo: { vehiculo: vehicleResponse[1] } }, search: 'first' };
                                    this._parseService.query(queryParams).then((vehiclePhotoResponse: any) => {
                                        if (!('message' in vehiclePhotoResponse[1])) {
                                            let file: string;
                                            if (vehiclePhotoResponse[0]) {
                                                file = vehiclePhotoResponse[1].get('photo').url();
                                            } else {
                                                file = '';
                                            }
                                            let servicio: string;
                                            if (data.tipoServicio && data.tipoServicio.nombre) {
                                                for (let i = 0; i < iterTipoServicioResponse[1].length; i++) {
                                                    if (data.tipoServicio.nombre === iterTipoServicioResponse[1][i].get('nombre')) {
                                                        servicio = iterTipoServicioResponse[1][i];
                                                        break;
                                                    }
                                                }
                                            } else {
                                                servicio = '';
                                            }

                                            this.modelVehicle = new VehicleForm(
                                                file,
                                                data.numeroSerie,
                                                data.numeroLugares,
                                                data.placa,
                                                data.color,
                                                data.modelo,
                                                servicio,
                                                data.licencia,
                                                data.idGPS,
                                                fechaRegistroString,
                                                data.status,
                                                data.tipo,
                                                data.marca,
                                                data.flota,
                                                data.objectId
                                            );

                                            this.activeForm = true;
                                            setTimeout(function() {
                                                if (vehiclePhotoResponse[0]) {
                                                    $('#fileInput').css({ 'border-left': '5px solid #42A948' });
                                                } else {
                                                    $('#fileInput').css({ 'border-left': '5px solid #a94442' });
                                                }
                                            }, 0);
                                        } else {
                                            $('#modalForm').modal('hide');
                                            this._notificationService.onError(vehiclePhotoResponse[1].message, 100000);
                                        }
                                    });
                                } else {
                                    $('#modalForm').modal('hide');
                                    if ('message' in vehicleResponse[1]) {
                                        this._notificationService.onError(vehicleResponse[1].message, 100000);
                                    } else {
                                        this._notificationService.onError('No se encontró vehiculo, intenta de nuevo por favor.', 100000);
                                    }
                                }
                            });
                        }
                    } else {
                        $('#modalForm').modal('hide');
                        if ('message' in iterTipoServicioResponse[1]) {
                            this._notificationService.onError(iterTipoServicioResponse[1].message, 100000);
                        } else {
                            this._notificationService.onError('No se encontró tipo de servicio, intenta de nuevo por favor.', 100000);
                        }
                    }
                });
                break;
        }
    }

    private onSave(): void {
        this.loadingSave = true;
        switch (this.selectedActivo) {
            case 'Chofer':
                if (this.optionChosen == 0) {
                    let saveParams = {
                        type: 'Object', option: 'new', className: 'Chofer', data: {
                            nombre: this.modelDriver.nombre,
                            apellidos: this.modelDriver.apellidos,
                            status: this.modelDriver.status,
                            ciudad: this.modelDriver.ciudad,
                            codigoPostal: this.modelDriver.codigoPostal,
                            fechaNacimiento: new Date(this.modelDriver.fechaNacimiento + "CDT12:00:00"),
                            email: this.modelDriver.email,
                            direccion: this.modelDriver.direccion,
                            fechaVencimientoLicencia: new Date(this.modelDriver.fechaVencimientoLicencia + "CDT12:00:00"),
                            telCelular: this.modelDriver.telCelular,
                            telCasa: this.modelDriver.telCasa,
                            totalTrips: 0,
                            iterMercado: this.modelDriver.iterMercado,
                            PIN: 1234,
                            userRatingAvg: '0',
                            deleted: false
                        }
                    };
                    this._parseService.saveObject(saveParams).then((choferCreated: any) => {
                        if (choferCreated[0]) {
                            let saveParams = {
                                type: 'User', data: {
                                    username: choferCreated[1].id,
                                    password: 'ev3rmw6TTALslUg',
                                    chofer: choferCreated[1],
                                    usertype: 2
                                }
                            };
                            this._parseService.saveObject(saveParams).then((userCreated: any) => {
                                if (userCreated[0]) {
                                    let saveParams = { type: 'File', fileName: 'choferProfileImage.png', base64: this.modelDriver.file };
                                    this._parseService.saveObject(saveParams).then((driverImageResult: any) => {
                                        if (driverImageResult[0]) {
                                            let saveParams = { type: 'Object', option: 'new', className: 'choferPhoto', data: { photo: driverImageResult[1], chofer: choferCreated[1] } };
                                            this._parseService.saveObject(saveParams).then((driverPhotoResult: any) => {
                                                if (driverPhotoResult[0]) {
                                                    $('#modalForm').modal('hide');
                                                    this._notificationService.onSuccess('Se creó chofer exitosamente!', 100000);
                                                    this.onSelect(this.selectedActivo);
                                                    let cloudFunctionParams = { functionName: 'SendgridUserPasswordReset', data: { userObjectId: userCreated[1].id } };
                                                    this._parseService.cloudFunction(cloudFunctionParams).then((cloudFunctionResult: any) => {
                                                        if (cloudFunctionResult[0]) {
                                                            this._notificationService.onSuccess('Se mando correo a chofer para cambiar la contraseña', 100000);
                                                        } else {
                                                            this._notificationService.onError('No se pudo mandar correo a chofer para cambiar la contraseña.', 100000);
                                                        }
                                                    });
                                                } else {
                                                    this._notificationService.onError('No se pudo crear foto de chofer, intenta de nuevo por favor.', 100000);
                                                }
                                                this.loadingSave = false;
                                            });
                                        } else {
                                            this._notificationService.onError('No se pudo crear foto de chofer, intenta de nuevo por favor.', 100000);
                                            this.loadingSave = false;
                                        }
                                    });
                                } else {
                                    this._notificationService.onError('No se pudo crear chofer, intenta de nuevo por favor.', 100000);
                                    this.loadingSave = false;
                                }
                            });
                        } else {
                            this._notificationService.onError('No se pudo crear chofer, intenta de nuevo por favor.', 100000);
                            this.loadingSave = false;
                        }
                    });

                } else if (this.optionChosen == 1) {
                    let queryParams = { className: 'Chofer', objectId: this.modelDriver.objectId, search: 'get' };
                    this._parseService.query(queryParams).then((driverResult: any) => {
                        if (driverResult[0]) {
                            let saveParams = {
                                type: 'Object', option: 'edit', object: driverResult[1], data: {
                                    nombre: this.modelDriver.nombre,
                                    apellidos: this.modelDriver.apellidos,
                                    status: this.modelDriver.status,
                                    ciudad: this.modelDriver.ciudad,
                                    codigoPostal: this.modelDriver.codigoPostal,
                                    fechaNacimiento: new Date(this.modelDriver.fechaNacimiento + "CDT12:00:00"),
                                    email: this.modelDriver.email,
                                    direccion: this.modelDriver.direccion,
                                    fechaVencimientoLicencia: new Date(this.modelDriver.fechaVencimientoLicencia + "CDT12:00:00"),
                                    telCelular: this.modelDriver.telCelular,
                                    telCasa: this.modelDriver.telCasa,
                                    iterMercado: this.modelDriver.iterMercado
                                }
                            };
                            this._parseService.saveObject(saveParams).then((choferSaved: any) => {
                                if (choferSaved[0]) {
                                    if (this.photoChanged) {
                                        let saveParams = { type: 'File', fileName: 'choferProfileImage.png', base64: this.modelDriver.file };
                                        this._parseService.saveObject(saveParams).then((driverImageResult: any) => {
                                            if (driverImageResult[0]) {
                                                let queryParams = { className: 'choferPhoto', constraints: { equalTo: { chofer: choferSaved[1] } }, search: 'first' };
                                                this._parseService.query(queryParams).then((driverPhotoResult: any) => {
                                                    if (!('message' in driverPhotoResult[1])) {
                                                        let saveParams: Object;
                                                        if (driverPhotoResult[0]) {
                                                            saveParams = { type: 'Object', option: 'edit', object: driverPhotoResult[1], data: { photo: driverImageResult[1] } };
                                                        } else {
                                                            saveParams = { type: 'Object', option: 'new', className: 'choferPhoto', data: { photo: driverImageResult[1], chofer: choferSaved[1] } };
                                                        }
                                                        this._parseService.saveObject(saveParams).then((driverPhotoSavedResult: any) => {
                                                            if (driverPhotoSavedResult[0]) {
                                                                $('#modalForm').modal('hide');
                                                                this._notificationService.onSuccess('Se guardó la información del chofer exitosamente!', 100000);
                                                                this.onSelect(this.selectedActivo);
                                                            } else {
                                                                this._notificationService.onError('No se pudo guardar foto del chofer, intenta de nuevo por favor.', 100000);
                                                            }
                                                            this.loadingSave = false;
                                                        });
                                                    } else {
                                                        this._notificationService.onError(driverPhotoResult[1].message, 100000);
                                                        this.loadingSave = false;
                                                    }
                                                });
                                            } else {
                                                this._notificationService.onError('No se pudo guardar foto del chofer, intenta de nuevo por favor.', 100000);
                                                this.loadingSave = false;
                                            }
                                        });
                                    } else {
                                        $('#modalForm').modal('hide');
                                        this._notificationService.onSuccess('Se guardó la información del chofer exitosamente!', 100000);
                                        this.onSelect(this.selectedActivo);
                                        this.loadingSave = false;
                                    }
                                } else {
                                    this._notificationService.onError('No se pudo guardar la información del chofer, intenta de nuevo por favor.', 100000);
                                    this.loadingSave = false;
                                }
                            });
                        } else {
                            this._notificationService.onError('No se encontró chofer, intenta de nuevo por favor.', 100000);
                            this.loadingSave = false;
                        }
                    });
                }
                break;

            case 'Vehiculo':
                if (this.optionChosen == 0) {
                    let saveParams = {
                        type: 'Object', option: 'new', className: 'Vehiculo', data: {
                            numeroSerie: this.modelVehicle.numeroSerie,
                            numeroLugares: this.modelVehicle.numeroLugares,
                            placa: this.modelVehicle.placa,
                            color: this.modelVehicle.color,
                            modelo: this.modelVehicle.modelo,
                            tipoServicio: this.modelVehicle.tipoServicio,
                            licencia: this.modelVehicle.licencia,
                            idGPS: this.modelVehicle.idGPS,
                            fechaRegistro: new Date(this.modelVehicle.fechaRegistro + "CDT12:00:00"),
                            status: this.modelVehicle.status,
                            tipo: this.modelVehicle.tipo,
                            marca: this.modelVehicle.marca,
                            flota: this.modelVehicle.flota,
                            deleted: false
                        }
                    };
                    this._parseService.saveObject(saveParams).then((vehicleResult: any) => {
                        if (vehicleResult[0]) {
                            if (this.photoChanged) {
                                let saveParams = { type: 'File', fileName: 'vehiculoProfileImage.png', base64: this.modelVehicle.file };
                                this._parseService.saveObject(saveParams).then((vehicleImageResult: any) => {
                                    if (vehicleImageResult[0]) {
                                        let saveParams = { type: 'Object', option: 'new', className: 'vehiculoPhoto', data: { photo: vehicleImageResult[1], vehiculo: vehicleResult[1] } };
                                        this._parseService.saveObject(saveParams).then((vehiclePhotoResult: any) => {
                                            if (vehiclePhotoResult[0]) {
                                                $('#modalForm').modal('hide');
                                                this._notificationService.onSuccess('Se creó vehiculo exitosamente!', 100000);
                                                this.onSelect(this.selectedActivo);
                                            } else {
                                                this._notificationService.onError('No se pudo crear foto del vehiculo, intenta de nuevo por favor.', 100000);
                                            }
                                            this.loadingSave = false;
                                        });
                                    } else {
                                        this._notificationService.onError('No se pudo crear foto del vehiculo, intenta de nuevo por favor.', 100000);
                                        this.loadingSave = false;
                                    }
                                });
                            } else {
                                $('#modalForm').modal('hide');
                                this._notificationService.onSuccess('Se creó vehiculo exitosamente!', 100000);
                                this.onSelect(this.selectedActivo);
                                this.loadingSave = false;
                            }
                        } else {
                            this._notificationService.onError('No se pudo crear vehiculo, intenta de nuevo por favor.', 100000);
                            this.loadingSave = false;
                        }
                    });

                } else if (this.optionChosen == 1) {
                    let queryParams = { className: 'Vehiculo', objectId: this.modelVehicle.objectId, search: 'get' };
                    this._parseService.query(queryParams).then((vehicleResult: any) => {
                        if (vehicleResult[0]) {
                            let saveParams = {
                                type: 'Object', option: 'edit', object: vehicleResult[1], data: {
                                    numeroSerie: this.modelVehicle.numeroSerie,
                                    numeroLugares: this.modelVehicle.numeroLugares,
                                    placa: this.modelVehicle.placa,
                                    color: this.modelVehicle.color,
                                    modelo: this.modelVehicle.modelo,
                                    tipoServicio: this.modelVehicle.tipoServicio,
                                    licencia: this.modelVehicle.licencia,
                                    idGPS: this.modelVehicle.idGPS,
                                    fechaRegistro: new Date(this.modelVehicle.fechaRegistro + "CDT12:00:00"),
                                    status: this.modelVehicle.status,
                                    tipo: this.modelVehicle.tipo,
                                    marca: this.modelVehicle.marca,
                                    flota: this.modelVehicle.flota
                                }
                            };
                            this._parseService.saveObject(saveParams).then((vehicleSavedResult: any) => {
                                if (vehicleSavedResult[0]) {
                                    if (this.photoChanged) {
                                        let saveParams = { type: 'File', fileName: 'vehiculoProfileImage.png', base64: this.modelVehicle.file };
                                        this._parseService.saveObject(saveParams).then((vehicleImageResult: any) => {
                                            if (vehicleImageResult[0]) {
                                                let queryParams = { className: 'vehiculoPhoto', constraints: { equalTo: { vehiculo: vehicleSavedResult[1] } }, search: 'first' };
                                                this._parseService.query(queryParams).then((vehiclePhotoResult: any) => {
                                                    if (!('message' in vehiclePhotoResult[1])) {
                                                        let saveParams: Object;
                                                        if (vehiclePhotoResult[0]) {
                                                            saveParams = { type: 'Object', option: 'edit', object: vehiclePhotoResult[1], data: { photo: vehicleImageResult[1] } };
                                                        } else {
                                                            saveParams = { type: 'Object', option: 'new', className: 'vehiculoPhoto', data: { photo: vehicleImageResult[1], vehiculo: vehicleSavedResult[1] } };
                                                        }
                                                        this._parseService.saveObject(saveParams).then((vehiclePhotoSavedResult: any) => {
                                                            if (vehiclePhotoSavedResult[0]) {
                                                                $('#modalForm').modal('hide');
                                                                this._notificationService.onSuccess('Se guardó la información del vehiculo exitosamente!', 100000);
                                                                this.onSelect(this.selectedActivo);
                                                            } else {
                                                                this._notificationService.onError('No se pudo guardar foto del vehiculo, intenta de nuevo por favor.', 100000);
                                                            }
                                                            this.loadingSave = false;
                                                        });
                                                    } else {
                                                        this._notificationService.onError(vehiclePhotoResult[1].message, 100000);
                                                        this.loadingSave = false;
                                                    }
                                                });
                                            } else {
                                                this._notificationService.onError('No se pudo guardar foto del vehiculo, intenta de nuevo por favor.', 100000);
                                                this.loadingSave = false;
                                            }
                                        });
                                    } else {
                                        $('#modalForm').modal('hide');
                                        this._notificationService.onSuccess('Se guardó la información del vehiculo exitosamente!', 100000);
                                        this.onSelect(this.selectedActivo);
                                        this.loadingSave = false;
                                    }
                                } else {
                                    this._notificationService.onError('No se pudo guardar la información vehiculo, intenta de nuevo por favor.', 100000);
                                    this.loadingSave = false;
                                }
                            });

                        } else {
                            this._notificationService.onError('No se encontró vehiculo, intenta de nuevo por favor.', 100000);
                            this.loadingSave = false;
                        }
                    });
                }
                break;
        }
    }

    private onErase(): void {
        this.loadingErase = true;
        let queryParams: Object;
        switch (this.selectedActivo) {
            case 'Chofer':
                queryParams = { className: this.selectedActivo, objectId: this.modelDriver.objectId, search: 'get' };
                this._parseService.query(queryParams).then((resultChofer: any) => {
                    if (resultChofer[0]) {
                        let saveParams = { type: 'Object', option: 'edit', object: resultChofer[1], data: { deleted: true } };
                        this._parseService.saveObject(saveParams).then((result: any) => {
                            if (result[0]) {
                                $('#modalForm').modal('hide');
                                this._notificationService.onSuccess('Se borró el chofer exitosamente!', 100000);
                                this.onSelect(this.selectedActivo);
                            } else {
                                this._notificationService.onError('No se pudo borrar el chofer, intenta de nuevo por favor.', 100000);
                            }
                            this.loadingErase = false;
                        });
                    } else {
                        this._notificationService.onError('No se pudo borrar el chofer, intenta de nuevo por favor.', 100000);
                        this.loadingErase = false;
                    }
                });
                break;

            case 'Vehiculo':
                queryParams = { className: this.selectedActivo, objectId: this.modelVehicle.objectId, search: 'get' };
                this._parseService.query(queryParams).then((resultVehicle: any) => {
                    if (resultVehicle[0]) {
                        let saveParams = { type: 'Object', option: 'edit', object: resultVehicle[1], data: { deleted: true } };
                        this._parseService.saveObject(saveParams).then((result: any) => {
                            if (result[0]) {
                                $('#modalForm').modal('hide');
                                this._notificationService.onSuccess('Se borró el vehículo exitosamente!', 100000);
                                this.onSelect(this.selectedActivo);
                            } else {
                                this._notificationService.onError('No se pudo borrar el vehículo, intenta de nuevo por favor.', 100000);
                            }
                            this.loadingErase = false;
                        });
                    } else {
                        this._notificationService.onError('No se pudo borrar el vehículo, intenta de nuevo por favor.', 100000);
                        this.loadingErase = false;
                    }
                });
                break;
        }
    }

    private onResetPassword(): void {
        this.loadingResetPass = true;
        let queryParams = { className: 'Chofer', objectId: this.modelDriver.objectId, search: 'get' };
        this._parseService.query(queryParams).then((resultChofer: any) => {
            if (resultChofer[0]) {
                let queryParams = { className: 'User', constraints: { equalTo: { chofer: resultChofer[1] } }, search: 'first' };
                this._parseService.query(queryParams).then((resultUser: any) => {
                    if (resultUser[0]) {
                        let cloudFunctionParams = { functionName: 'SendgridUserPasswordReset', data: { userObjectId: resultUser[1].id } };
                        this._parseService.cloudFunction(cloudFunctionParams).then((cloudFunctionResult: any) => {
                            if (cloudFunctionResult[0]) {
                                this._notificationService.onSuccess('Se mando correo a chofer para cambiar la contraseña', 100000);
                            } else {
                                this._notificationService.onError('No se pudo mandar correo a chofer para cambiar la contraseña.', 100000);
                            }
                            this.loadingResetPass = false;
                        });
                    } else {
                        this._notificationService.onError('No se pudo mandar correo a chofer para cambiar la contraseña.', 100000);
                        this.loadingResetPass = false;
                    }
                });
            } else {
                this._notificationService.onError('No se pudo mandar correo a chofer para cambiar la contraseña.', 100000);
                this.loadingResetPass = false;
            }
        });
    }

    private createAsignacionGridData(): void {
        this.activeAssign = true;
        this.loadingSave = false;
        delete this.objectSelected;
        this.asignacionColumnDefs = [
            {
                headerName: "Estatus", field: "status", width: 80,
                cellStyle: function(params: any) {
                    if (params.data.status == 0) {
                        return { color: 'white', backgroundColor: 'red', 'font-size': 15 };
                    } else if (params.data.status == 1) {
                        return { color: 'white', backgroundColor: 'green', 'font-size': 15 };
                    }
                },
                cellRenderer: function(params: any) {
                    if (params.data.status == 0) {
                        return '<span>' + 'Inactivo' + '</span>';
                    } else if (params.data.status == 1) {
                        return '<span>' + 'Activo' + '</span>';
                    }
                }
            },
            { headerName: "Placa", field: "placa", width: 150, cellStyle: { 'font-size': 15 } },
            { headerName: "Numero Serie", field: "numeroSerie", width: 150, cellStyle: { 'font-size': 15 } },
            { headerName: "Modelo", field: "modelo", width: 150, cellStyle: { 'font-size': 15 } },
            { headerName: "Tipo Servicio", field: "tipoServicio.nombre", width: 150, cellStyle: { 'font-size': 15 } },
            { headerName: "Fecha Registro", field: "fechaRegistro.iso", width: 150, cellStyle: { 'font-size': 15 } },
            { headerName: "Marca", field: "marca", width: 150, cellStyle: { 'font-size': 15 } },
            { headerName: "Flota", field: "flota", width: 150, cellStyle: { 'font-size': 15 } },
            { headerName: "Color", field: "color", width: 150, cellStyle: { 'font-size': 15 } },
            { headerName: "Id GPS", field: "idGPS", width: 150, cellStyle: { 'font-size': 15 } },
            { headerName: "Tipo", field: "tipo", width: 150, cellStyle: { 'font-size': 15 } },
            { headerName: "Licencia", field: "licencia", width: 150, cellStyle: { 'font-size': 15 } },
            { headerName: "Numero Lugares", field: "numeroLugares", width: 150, cellStyle: { 'font-size': 15 } }
        ];
        let queryParams = { className: 'Asignacion', search: 'find' };
        this._parseService.query(queryParams).then((assigned: any) => {
            if (assigned[0]) {
                let assignedArray: Object[] = [];
                for (let i = 0; i < assigned[1].length; i++) {
                    assignedArray.push(assigned[1][i].get('vehiculo').id);
                }
                let queryParams = {
                    className: 'Vehiculo', constraints: {
                        equalTo: { deleted: false },
                        notContainedIn: { objectId: assignedArray },
                        include: ['tipoServicio'],
                        limit: 1000
                    }, search: 'find'
                };
                this._parseService.query(queryParams).then((result: any) => {
                    if (result[0]) {
                        this.asignacionRowData = JSON.parse(JSON.stringify(result[1]));
                    } else {
                        this.asignacionRowData = [];
                    }
                });
            }
        });
        setTimeout(function() {
            $('#modalAsignacion, .modal-body').animate({ scrollTop: $("#asignacionAgGrid").offset().top - 50 }, 1000);
        }, 0);
    }

    private assign(): void {
        this.loadingSave = true;
        let queryParams = { className: 'Vehiculo', objectId: this.objectSelected.objectId, search: 'get' };
        this._parseService.query(queryParams).then((resultVehicle: any) => {
            if (resultVehicle[0]) {
                if (this.vehicleAssigned) {
                    let queryParams = { className: 'Asignacion', objectId: this.asignacion.assignId, search: 'get' };
                    this._parseService.query(queryParams).then((resultAssign: any) => {
                        if (resultAssign[0]) {
                            let saveParams = {
                                type: 'Object', option: 'edit', object: resultAssign[1],
                                data: {
                                    vehiculo: resultVehicle[1],
                                    pubNubChannel: this.asignacion.driverId + '-' + resultVehicle[1].id,
                                    status: 0
                                }
                            };
                            this._parseService.saveObject(saveParams).then((result: any) => {
                                if (result[0]) {
                                    let queryParams = { className: 'vehiculoPhoto', constraints: { equalTo: { vehiculo: resultVehicle[1] } }, search: 'first' };
                                    this._parseService.query(queryParams).then((vehiculoPhotoResponse: any) => {
                                        if (!('message' in vehiculoPhotoResponse[1])) {
                                            let vehiclePhoto: string;
                                            if (vehiculoPhotoResponse[0]) {
                                                vehiclePhoto = vehiculoPhotoResponse[1].get('photo').url();
                                            } else {
                                                vehiclePhoto = '';
                                            }

                                            let tipoServicio: string;
                                            if ('tipoServicio' in this.objectSelected) {
                                                tipoServicio = this.objectSelected.tipoServicio.nombre;
                                            } else {
                                                tipoServicio = '';
                                            }

                                            this.asignacion.vehiclePhoto = vehiclePhoto;
                                            this.asignacion.vehicleModel = this.objectSelected.modelo;
                                            this.asignacion.vehicleColor = this.objectSelected.color;
                                            this.asignacion.vehiclePlates = this.objectSelected.placa;
                                            this.asignacion.vehicleServiceType = tipoServicio;
                                            this.asignacion.vehicleCompany = this.objectSelected.flota;
                                            this.activeAssign = false;
                                            this._notificationService.onSuccess('Se asignó el vehículo exitosamente!', 100000);
                                        } else {
                                            this._notificationService.onError(vehiculoPhotoResponse[1].message, 100000);
                                        }
                                        this.loadingSave = false;
                                    });
                                } else {
                                    this._notificationService.onError('No se pudo asignar el vehículo, intenta de nuevo por favor.', 100000);
                                    this.loadingSave = false;
                                }
                            });
                        } else {
                            this._notificationService.onError('No se encontró asignación, intenta de nuevo por favor.', 100000);
                            this.loadingSave = false;
                        }
                    });
                } else {
                    let queryParams = { className: 'Chofer', objectId: this.asignacion.driverId, search: 'get' };
                    this._parseService.query(queryParams).then((resultChofer: any) => {
                        if (resultChofer[0]) {
                            let saveParams = {
                                type: 'Object', option: 'new', className: 'Asignacion',
                                data: {
                                    vehiculo: resultVehicle[1],
                                    pubNubChannel: resultChofer[1].id + '-' + resultVehicle[1].id,
                                    chofer: resultChofer[1],
                                    status: 0
                                }
                            };
                            this._parseService.saveObject(saveParams).then((asignacionCreated: any) => {
                                if (asignacionCreated[0]) {
                                    let queryParams = { className: 'vehiculoPhoto', constraints: { equalTo: { vehiculo: resultVehicle[1] } }, search: 'first' };
                                    this._parseService.query(queryParams).then((vehiculoPhotoResponse: any) => {
                                        if (!('message' in vehiculoPhotoResponse[1])) {
                                            let vehiclePhoto: string;
                                            if (vehiculoPhotoResponse[0]) {
                                                vehiclePhoto = vehiculoPhotoResponse[1].get('photo').url();
                                            } else {
                                                vehiclePhoto = '';
                                            }

                                            let tipoServicio: string;
                                            if ('tipoServicio' in this.objectSelected) {
                                                tipoServicio = this.objectSelected.tipoServicio.nombre;
                                            } else {
                                                tipoServicio = '';
                                            }

                                            this.asignacion.assignId = asignacionCreated[1].id;
                                            this.asignacion.vehiclePhoto = vehiclePhoto;
                                            this.asignacion.vehicleModel = this.objectSelected.modelo;
                                            this.asignacion.vehicleColor = this.objectSelected.color;
                                            this.asignacion.vehiclePlates = this.objectSelected.placa;
                                            this.asignacion.vehicleServiceType = tipoServicio;
                                            this.asignacion.vehicleCompany = this.objectSelected.flota;
                                            this.vehicleAssigned = true;
                                            this.activeAssign = false;
                                            this._notificationService.onSuccess('Se asignó el vehículo exitosamente!', 100000);
                                        } else {
                                            this._notificationService.onError(vehiculoPhotoResponse[1].message, 100000);
                                        }
                                        this.loadingSave = false;
                                    });
                                } else {
                                    this._notificationService.onError('No se pudo asignar vehículo, intenta de nuevo por favor.', 100000);
                                    this.loadingSave = false;
                                }
                            });
                        } else {
                            this._notificationService.onError('No se encontró chofer, intenta de nuevo por favor.', 100000);
                            this.loadingSave = false;
                        }
                    });
                }
            } else {
                this._notificationService.onError('No se encontró vehiculo, intenta de nuevo por favor.', 100000);
                this.loadingSave = false;
            }
        });
    }

    private fileChange(input: any): void {
        if (input.files.length > 0) {
            let self = this;
            this.getOrientation(input.files[0], function(orientation: number) {
                // alert('orientation: ' + orientation);

                // Create an img element and add the image file data to it
                let img = document.createElement("img");
                img.src = window.URL.createObjectURL(input.files[0]);

                // Create a FileReader
                let reader = new FileReader();

                // Add an event listener to deal with the file when the reader is complete
                reader.addEventListener("load", (event: any) => {
                    // Get the event.target.result from the reader (base64 of the image)
                    img.src = event.target.result;

                    // Resize the image
                    let resized_img = self.resize(img, orientation, 300, 300);

                    // Push the img src (base64 string) into our array that we display in our html template
                    if (self.selectedActivo == 'Chofer') {
                        self.modelDriver.file = resized_img;
                    } else if (self.selectedActivo == 'Vehiculo') {
                        self.modelVehicle.file = resized_img;
                    }

                    $('#fileInput').css({ 'border-left': '5px solid #42A948' });
                    self.photo = true;
                    self.photoChanged = true;
                }, false);

                reader.readAsDataURL(input.files[0]);
            });
        } else {
            $('#fileInput').css({ 'border-left': '5px solid #a94442' });
            this.photo = false;
            this.photoChanged = false;
            if (this.selectedActivo == 'Chofer') {
                this.modelDriver.file = '';
            } else if (this.selectedActivo == 'Vehiculo') {
                this.modelVehicle.file = '';
            }
        }
    }

    private getOrientation(file: any, callback: any): void {
        let reader = new FileReader();
        reader.onload = function(e: any) {

            let view = new DataView(e.target.result);
            if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
            let length = view.byteLength, offset = 2;
            while (offset < length) {
                let marker = view.getUint16(offset, false);
                offset += 2;
                if (marker == 0xFFE1) {
                    if (view.getUint32(offset += 2, false) != 0x45786966) return callback(-1);
                    let little = view.getUint16(offset += 6, false) == 0x4949;
                    offset += view.getUint32(offset + 4, little);
                    let tags = view.getUint16(offset, little);
                    offset += 2;
                    for (let i = 0; i < tags; i++)
                        if (view.getUint16(offset + (i * 12), little) == 0x0112)
                            return callback(view.getUint16(offset + (i * 12) + 8, little));
                }
                else if ((marker & 0xFF00) != 0xFF00) break;
                else offset += view.getUint16(offset, false);
            }
            return callback(-1);
        };
        reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
    }

    private resize(img: any, orientation: number, MAX_WIDTH: number, MAX_HEIGHT: number) {
        let canvas = document.createElement("canvas");

        // console.log("Size Before: " + img.src.length + " bytes");

        let width = img.width;
        let height = img.height;

        if (width > height) {
            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }
        } else {
            if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
            }
        }

        let ctx = canvas.getContext("2d");

        switch (orientation) {
            case 1:
                canvas.width = width;
                canvas.height = height;
                break;

            case 8:
                // 90° rotate left
                canvas.width = height;
                canvas.height = width;
                ctx.rotate(-0.5 * Math.PI)
                ctx.translate(-width, 0)
                break;
            case 3:
                // 180° rotate left
                canvas.width = width;
                canvas.height = height;
                ctx.translate(width, height)
                ctx.rotate(Math.PI)
                break;
            case 6:
                // 90° rotate right
                canvas.width = height;
                canvas.height = width;
                ctx.rotate(0.5 * Math.PI);
                ctx.translate(0, -height);
                break;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl = canvas.toDataURL('image/png');

        // console.log("Size After:  " + dataUrl.length + " bytes");
        return dataUrl
    }
}
