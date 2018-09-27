import { Component, OnInit, ViewChild } from '@angular/core';
import { ParseService } from '../../../services/parse.service';
import { NotificationService } from '../../../services/notification.service';
import { MarkerLocation } from '../../../classes/marker';
import { SebmGoogleMap } from 'angular2-google-maps/core';
declare var PubNub: any;
declare var $: any;

@Component({
  selector: 'app-monitoreo-viajes',
  templateUrl: './monitoreo-viajes.component.html',
  styleUrls: ['./monitoreo-viajes.component.css']
})
export class MonitoreoViajesComponent implements OnInit {
  public viajes: any;
  private viaje: any;
  private interval: any;
  public markers: MarkerLocation[];
  public requestedFrom: number;
  private pubnub: any;
  @ViewChild(SebmGoogleMap) map: SebmGoogleMap;

  constructor(
    public _parseService: ParseService,
    private _notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    // console.log("MonitoreoViajesComponent running");
    this.pubnub = new PubNub({
      subscribeKey: "sub-c-878a01ec-b908-11e7-97d2-5eb2fdfa058b",
      publishKey: "pub-c-bec524d7-2f64-405e-9750-2f19750982ec",
      ssl: true,
    });
    this.markers = [{
      type: '',
      lat: 0,
      lng: 0,
      url: '',
      draggable: false
    }];
    this.requestedFrom = 0;
    this.createTripsData();
    this.interval = setInterval(() => { this.createTripsData() }, 15000);
  }


  ngOnDestroy(): void {
    // console.log('MonitoreoViajesComponent destroying');
    clearInterval(this.interval);
  }

  public createTripsData(): void {
    let queryParams: any;
    if (this.requestedFrom == 3) {
      if (this._parseService.isLoggedIn().id == 'C0t3MRgh9E') {
        queryParams = {
          className: 'Viaje',
          constraints: {
            equalTo: { status: 0 },
            exists: ['asignacion', 'puntoInicial', 'pasajero'],
            ascending: "createdAt",
            select: ["asignacion", "puntoInicial", "status", "pasajero", "userOriginPlace", "requestedFrom"],
            include: ['pasajero', 'asignacion.chofer.iterMercado', 'asignacion.vehiculo.tipoServicio'],
            limit: 1000
          },
          search: 'find'
        };
      } else {
        queryParams = {
          className: 'Viaje',
          constraints: {
            equalTo: { callCenterUser: this._parseService.isLoggedIn(), status: 0 },
            exists: ['asignacion', 'puntoInicial', 'pasajero'],
            ascending: "createdAt",
            select: ["asignacion", "puntoInicial", "status", "pasajero", "userOriginPlace", "requestedFrom"],
            include: ['pasajero', 'asignacion.chofer.iterMercado', 'asignacion.vehiculo.tipoServicio'],
            limit: 1000
          },
          search: 'find'
        };
      }
    } else {
      if (this._parseService.isLoggedIn().id == 'C0t3MRgh9E') {
        queryParams = {
          className: 'Viaje',
          constraints: {
            equalTo: { requestedFrom: this.requestedFrom, status: 0 },
            exists: ['asignacion', 'puntoInicial', 'pasajero'],
            ascending: "createdAt",
            select: ["asignacion", "puntoInicial", "status", "pasajero", "userOriginPlace", "requestedFrom"],
            include: ['pasajero', 'asignacion.chofer.iterMercado', 'asignacion.vehiculo.tipoServicio'],
            limit: 1000
          },
          search: 'find'
        };
      } else {
        queryParams = {
          className: 'Viaje',
          constraints: {
            equalTo: { requestedFrom: this.requestedFrom, callCenterUser: this._parseService.isLoggedIn(), status: 0 },
            exists: ['asignacion', 'puntoInicial', 'pasajero'],
            ascending: "createdAt",
            select: ["asignacion", "puntoInicial", "status", "pasajero", "userOriginPlace", "requestedFrom"],
            include: ['pasajero', 'asignacion.chofer.iterMercado', 'asignacion.vehiculo.tipoServicio'],
            limit: 1000
          },
          search: 'find'
        };
      }
    }
    this._parseService.query(queryParams).then((response: any) => {
      // console.log('Checking active trips');
      if (response[0]) {
        this.viajes = JSON.parse(JSON.stringify(response[1]));
        if (this.viaje) {
          for (let i = 0; i < this.viajes.length; i++) {
            if (this.viaje.objectId == this.viajes[i].objectId) {
              this.markers = [{
                id: this.viajes[i].objectId,
                type: 'rider',
                lat: this.viajes[i].puntoInicial.latitude,
                lng: this.viajes[i].puntoInicial.longitude,
                url: "../../../../assets/glyphicons-person.png",
                draggable: false
              }, {
                  id: this.viajes[i].objectId,
                  type: 'driver',
                  lat: this.viajes[i].asignacion.lastLocation.latitude,
                  lng: this.viajes[i].asignacion.lastLocation.longitude,
                  url: "../../../../assets/glyphicons-569-taxi.png",
                  draggable: false
                }];
            }
          }
        }
      } else {
        this.viajes = [];
      }
    });
  }

  private showDetails(viaje: any, index: number): void {
    this.viaje = viaje;
    setTimeout(() => {
      this.map.triggerResize();
      setTimeout(() => {
        this.markers = [{
          id: viaje.objectId,
          type: 'rider',
          lat: viaje.puntoInicial.latitude,
          lng: viaje.puntoInicial.longitude,
          url: "../../../../assets/glyphicons-person.png",
          draggable: false
        }, {
            id: viaje.objectId,
            type: 'driver',
            lat: viaje.asignacion.lastLocation.latitude,
            lng: viaje.asignacion.lastLocation.longitude,
            url: "../../../../assets/glyphicons-569-taxi.png",
            draggable: false
          }];
      }, 0);
    }, 200);
  }

  public cancelTrip(): void {
    let cloudFunctionParams = {
      functionName: 'cancelTripRequest', data: {
        viajeObjID: this.viaje.objectId,
        cancelBy: 'callCenter'
      }
    };
    this._parseService.cloudFunction(cloudFunctionParams).then((response: any) => {
      if (response[0]) {
        this._notificationService.onSuccess('Se canceló el viaje. ', 100000);
        delete this.viaje;
        $('#modalConfirmation').modal('hide');
        $('#modalTrip').modal('hide');
        this.createTripsData();
      } else {
        this._notificationService.onError('No se pudo cancelar el viaje, por favor intenta de nuevo.', 100000);
      }
    });
  }
}
