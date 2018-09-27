export class MarkerInfo {

    constructor(
        public pubNubChannel: string,
        public lat: number,
        public lng: number,
        public url: string,
        public nombre: string,
        public apellidos: string,
        public telefono: string,
        public tipo: string,
        public modelo: string,
        public placa: string,
        public color: string,
        public flota: string
    ) { }
}

export class MarkerLocation {

    constructor(
        public type: string,
        public lat: number,
        public lng: number,
        public draggable: boolean,
        public url: string,
        public id?: string
    ) { }
}
