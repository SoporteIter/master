import { Component, OnInit } from '@angular/core';
import { ParseService } from '../../services/parse.service';
import { SessionRouterService } from '../../services/session-router.service';
import { MarkerInfo } from '../../classes/marker';
declare var PubNub: any;

@Component({
  selector: 'app-monitoreo',
  templateUrl: './monitoreo.component.html',
  styleUrls: ['./monitoreo.component.css']
})
export class MonitoreoComponent implements OnInit {
    public lat: number;
    public lng: number;
    public zoom: number;
    public markers: MarkerInfo[];
    public onlineDrivers: number;
    private pubnub: any;
    private channels: any;
    private interval: any;

    constructor(
        private _parseService: ParseService,
        private _sessionRouterService: SessionRouterService
      ) { }

    ngOnInit(): void {
        // console.log("MonitoreoComponent running");
        this._sessionRouterService.sessionRouter('Monitoreo');
        this.lat = 19.2856391;
        this.lng = -99.6130955;
        this.zoom = 12;
        this.markers = [];
        this.onlineDrivers = 0;
        this.pubnub = new PubNub({
            subscribeKey: "sub-c-878a01ec-b908-11e7-97d2-5eb2fdfa058b",
            publishKey: "pub-c-bec524d7-2f64-405e-9750-2f19750982ec",
            ssl: true,
        });
        this.addEventListener(this);
        this.channels = ['Toluca'];
        this.subscribe(this.channels);
        this.checkWhosOnline();
        this.interval = setInterval(() => { this.checkWhosOnline() }, 10000);
    }

    ngOnDestroy(): void {
        // console.log('MonitoreoComponent destroying');
        clearInterval(this.interval);
        this.unsubscribe(this.channels);
    }

    private unsubscribe(channels: string[]): void {
        console.log('Unsubscribing from:', channels);
        this.pubnub.unsubscribe({
            channels: [channels]
        });
    }

    private addEventListener(self: any): void {
        this.pubnub.addListener({
            status: function(statusEvent: any) {
                // console.log('Status event:', statusEvent);
            },
            message: function(message: any) {
                console.log('Channel', message.subscribedChannel, ':', message.message);

                if (message.message.message !== "startPubllishing") {
                    if (self.markers[0] !== undefined) {
                        let index = self.findIndex(message.message.asignacion);
                        console.log(index);
                        if (!(index == self.markers.length)) {
                            console.log("Update element array");
                            self.markers[index] = {
                                pubNubChannel: self.markers[index].pubNubChannel,
                                lat: message.message.lat,
                                lng: message.message.lng,
                                url: self.markers[index].url,
                                nombre: self.markers[index].nombre,
                                apellidos: self.markers[index].apellidos,
                                telefono: self.markers[index].telefono,
                                tipo: self.markers[index].tipo,
                                modelo: self.markers[index].modelo,
                                placa: self.markers[index].placa,
                                color: self.markers[index].color,
                                flota: self.markers[index].flota
                            };
                        } else {
                            console.log("Add new element to array");
                            self._parseService.getObject('Asignacion', 'pubNubChannel', message.message.asignacion, ['chofer', 'vehiculo']).then((objectAsignacion: any) => {
                                if (objectAsignacion[0]) {
                                    let result = JSON.parse(JSON.stringify(objectAsignacion[1]));
                                    self.markers.push({
                                        pubNubChannel: message.message.asignacion,
                                        lat: message.message.lat,
                                        lng: message.message.lng,
                                        url: "../../../assets/glyphicons-569-taxi.png",
                                        nombre: result.chofer.nombre,
                                        apellidos: result.chofer.apellidos,
                                        telefono: result.chofer.telCelular,
                                        tipo: result.vehiculo.tipo,
                                        modelo: result.vehiculo.modelo,
                                        placa: result.vehiculo.placa,
                                        color: result.vehiculo.color,
                                        flota: result.vehiculo.flota
                                    });
                                }
                            });
                        }
                    } else {
                        console.log("Add new element to array because undefined");
                        self._parseService.getObject('Asignacion', 'pubNubChannel', message.message.asignacion, ['chofer', 'vehiculo']).then((objectAsignacion: any) => {
                            if (objectAsignacion[0]) {
                                let result = JSON.parse(JSON.stringify(objectAsignacion[1]));
                                self.markers.push({
                                    pubNubChannel: message.message.asignacion,
                                    lat: message.message.lat,
                                    lng: message.message.lng,
                                    url: "../../../assets/glyphicons-569-taxi.png",
                                    nombre: result.chofer.nombre,
                                    apellidos: result.chofer.apellidos,
                                    telefono: result.chofer.telCelular,
                                    tipo: result.vehiculo.tipo,
                                    modelo: result.vehiculo.modelo,
                                    placa: result.vehiculo.placa,
                                    color: result.vehiculo.color,
                                    flota: result.vehiculo.flota
                                });
                            }
                        });
                    }
                }
            }
        });
    }

    private subscribe(channels: string[]): void {
        console.log('Connecting to channels:', channels);
        console.log("Subscribing..");
        this.pubnub.subscribe({
            channels: [channels]
        });
    }

    private findIndex(asignacion: Object) {
        let index: number;
        for (let i = 0; i < this.markers.length; i++) {
            if (this.markers[i].pubNubChannel === asignacion) {
                index = i;
                break;
            } else {
                index = this.markers.length;
            }
        }
        return index;
    }

    private checkWhosOnline(): void {
        console.log("Checking whos online");
        let onlineDrivers = 0;
        let queryParams = { className: 'Asignacion', constraints: { limit: 1000 }, search: 'find' };
        this._parseService.query(queryParams).then((response: any) => {
            if (response[0]) {
                let result = JSON.parse(JSON.stringify(response[1]));
                if (this.markers[0] === undefined) {
                    for (let p = 0; p < result.length; p++) {
                        if (result[p].status != 0) {
                            onlineDrivers++;
                        }
                    }
                } else {
                    for (let m = 0; m < this.markers.length; m++) {
                        for (let p = 0; p < result.length; p++) {
                            if (this.markers[m].pubNubChannel === result[p].pubNubChannel) {
                                if (result[p].status == 0) {
                                    this.markers.splice(m, 1);
                                }
                            }
                            if ((result[p].status !== 0) && (m == 0)) {
                                onlineDrivers++;
                            }
                        }
                    }
                }
                this.onlineDrivers = onlineDrivers;
            }
        });
        console.log("Online", this.markers);
    }
}
