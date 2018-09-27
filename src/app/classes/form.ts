export class SignInForm {

    constructor(
        public username: string,
        public password: string
    ) { }
}

export class DriverForm {

    constructor(
        public file: string,
        public nombre: string,
        public apellidos: string,
        public status: number,
        public ciudad: string,
        public codigoPostal: string,
        public fechaNacimiento: string,
        public email: string,
        public direccion: string,
        public fechaVencimientoLicencia: string,
        public telCelular: string,
        public telCasa: string,
        public iterMercado: Object,
        public objectId?: string
    ) { }
}

export class VehicleForm {

    constructor(
        public file: string,
        public numeroSerie: string,
        public numeroLugares: string,
        public placa: string,
        public color: string,
        public modelo: string,
        public tipoServicio: Object,
        public licencia: string,
        public idGPS: string,
        public fechaRegistro: string,
        public status: number,
        public tipo: string,
        public marca: string,
        public flota: string,
        public objectId?: string
    ) { }
}

export class UserForm {

    constructor(
        public firstName: string,
        public lastName: string,
        public phoneNumber: string,
        public email: string,
        public objectId?: string
    ) { }
}

export class Asignacion {

    constructor(
        public assignId: string,
        public driverId: string,
        public driverPhoto: string,
        public driverName: string,
        public driverIterMercado: string,
        public driverCellPhone: string,
        public driverRatingAvg: string,
        public vehiclePhoto: string,
        public vehicleModel: string,
        public vehicleColor: string,
        public vehiclePlates: string,
        public vehicleServiceType: string,
        public vehicleCompany: string
    ) { }
}
