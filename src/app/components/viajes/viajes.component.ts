import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { ParseService } from '../../services/parse.service';
import { NotificationService } from '../../services/notification.service';
import { SessionRouterService } from '../../services/session-router.service';
import { GridOptions } from 'ag-grid/main';
import { MarkerLocation } from '../../classes/marker';
import { MapsAPILoader, MouseEvent } from 'angular2-google-maps/core';
import { UserForm } from '../../classes/form';
declare var PubNub: any;
declare var google: any;
declare var $: any;

@Component({
  selector: 'app-viajes',
  templateUrl: './viajes.component.html',
  styleUrls: ['./viajes.component.css']
})
export class ViajesComponent implements OnInit {
  // ag-grid-ng2
  public gridOptions: GridOptions;
  public rowData: any[];
  public columnDefs: any[];

  private modelUser = new UserForm('', '', '', '');
  private userOption: number;
  public activeUser: boolean;

  private selectedPasajero: any;
  private viaje: any;

  private pubnub: any;

  // angular2-google-maps
  public lat: number;
  public lng: number;
  public zoom: number;
  public markers: MarkerLocation[];

  private origin: number[];
  private destination: number[];
  private originPlace: string;
  private destinationPlace: string;
  private pago: string;
  public onlineDrivers: any[];
  public offlineDrivers: any[];
  public ontripDrivers: any[];
  public drivers: any[];
  public asignacionStatusSelected: number;
  public driversFilter: any;
  private tiempoLlegada: string;
  public tiempoViaje: string;
  public tarifaEstimada: number;

  public tripAsigned: boolean;
  public tripRequested: boolean;

  public loading: boolean;
  private userLoading: boolean;

  private interval: any;

  public servicios: any;
  public servicioSelected: string;

  public mercados: any;
  public mercadoSelected: string;
  private mercadoIdSelected: string;

  public requestsWithNoDriver: any[];
  private noDriverAvailableUser: any;

  constructor(
    private _parseService: ParseService,
    private _loader: MapsAPILoader,
    private _notificationService: NotificationService,
    private _sessionRouterService: SessionRouterService
  ) { }

  ngOnInit(): void {
    // console.log("ViajesComponent running");
    this._sessionRouterService.sessionRouter('Viajes');
    this.activeUser = true;
    this.gridOptions = <GridOptions>{};
    this.gridOptions.rowHeight = 30;
    this.pubnub = new PubNub({
      subscribeKey: "sub-c-878a01ec-b908-11e7-97d2-5eb2fdfa058b",
      publishKey: "pub-c-bec524d7-2f64-405e-9750-2f19750982ec",
      ssl: true
    });
    this.addEventListener();
    this.pubnub.subscribe({
      channels: ['Informacion']
    });
    this.lat = 19.2856391;
    this.lng = -99.6130955;
    this.zoom = 13;
    this.markers = [];
    this.createRowData();
    this.createColumnDefs();
    this.servicioSelected = 'Clásico';
    this.mercadoSelected = 'Estado de México';
    this.mercadoIdSelected = 'AUrmrpyHNW';
    this.getMercadoAndServicio();
    this.pago = 'Efectivo';
    this.tiempoLlegada = "0 mins";
    this.tiempoViaje = "0 mins";
    this.tarifaEstimada = 0;
    this.tripAsigned = false;
    this.loading = false;
    this.userLoading = false;
    this.tripRequested = false;
    this.autocomplete();
    this.onlineDrivers = [];
    this.offlineDrivers = [];
    this.ontripDrivers = [];
    this.drivers = [];
    this.requestsWithNoDriver = [];
    this.asignacionStatusSelected = 1;
    this.driversFilter = { online: true, offline: false, ontrip: true };
    this.getDrivers();
    this.interval = setInterval(() => { this.getDrivers() }, 15000);
  }

  ngOnDestroy(): void {
    // console.log('ViajesComponent destroying');
    clearInterval(this.interval);
    if (this.viaje) {
      this.unsubscribe([this.viaje.objectId, 'Informacion']);
    } else {
      this.unsubscribe(['Informacion']);
    }
  }

  private createRowData(skip = 0, data = []): void {
    let queryParams;
    if (this._parseService.isLoggedIn().id == 'C0t3MRgh9E') {
      queryParams = { className: 'User', constraints: { doesNotExist: ['chofer'], limit: 1000, skip: skip }, search: 'find' };
    } else {
      queryParams = { className: 'User', constraints: { doesNotExist: ['chofer'], equalTo: { callCenterUser: this._parseService.isLoggedIn() }, limit: 1000, skip: skip }, search: 'find' };
    }
    this._parseService.query(queryParams).then((response: any) => {
      if (response[0]) {
        data.push.apply(data, JSON.parse(JSON.stringify(response[1])));
        if (JSON.parse(JSON.stringify(response[1])).length == 1000) {
          this.createRowData(skip + 1000, data);
        } else {
          this.rowData = data;
        }
      } else {
        this.rowData = data;
      }
    });
  }

  private createColumnDefs(): void {
    let self = this;
    this.columnDefs = [
      {
        headerName: "Editar", field: "editar", width: 50,
        cellRenderer: function(params: any) {
          let eDiv = document.createElement('div');
          eDiv.innerHTML = '<button class="btn-primary btn-xs"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>';
          eDiv.querySelectorAll('.btn-primary')[0].addEventListener('click', function(mouseEvent: any) {
            // console.log('button was clicked!!', mouseEvent, params);
            self.userForm(1, params.data);
          });
          return eDiv;
        }, cellStyle: { "text-align": "center" }
      },
      { headerName: "Nombre", field: "nombre", width: 225, cellStyle: { 'font-size': 20 } },
      { headerName: "Apellidos", field: "apellidos", width: 225, cellStyle: { 'font-size': 20 } },
      { headerName: "Email", field: "email", width: 225, cellStyle: { 'font-size': 20 } },
      { headerName: "Tel cel", field: "cellPhoneNumber", width: 160, cellStyle: { 'font-size': 20 } }
    ];
  }

  public onRowClicked($event: any): void {
    // console.log('onRowClicked: ', $event.node.data);
    $('#inputSearchInput').css({ 'border-color': '#7fdb00' });
    $('#agGrid').css({ 'border-color': '#7fdb00' });
    this.selectedPasajero = $event.node.data;
    if ($event.node.data.cellPhoneNumber) {
      $('#inputSearchInput').val($event.node.data.cellPhoneNumber);
    } else {
      $('#inputSearchInput').val($event.node.data.nombre + ' ' + $event.node.data.apellidos);
    }
  }

  public onModelUpdated(): void {
    // console.log('onModelUpdated');
    if (this.selectedPasajero) {
      let self = this;
      if (this.selectedPasajero.cellPhoneNumber) {
        $('#inputSearchInput').val(this.selectedPasajero.cellPhoneNumber);
      } else {
        $('#inputSearchInput').val(this.selectedPasajero.nombre + ' ' + this.selectedPasajero.apellidos);
      }
      this.gridOptions.api.setQuickFilter(this.selectedPasajero.cellPhoneNumber);
      this.gridOptions.api.forEachNode(function(node) {
        if (node.data.cellPhoneNumber === self.selectedPasajero.cellPhoneNumber) {
          node.setSelected(true);
        }
      });
    }
  }

  public onQuickFilterChanged($event: any): void {
    $('#inputSearchInput').css({ 'border-color': '#7fdb00' });
    $('#agGrid').css({ 'border-color': '#7fdb00' });
    this.gridOptions.api.setQuickFilter($event.target.value);
    delete this.selectedPasajero;
    this.gridOptions.api.forEachNode(function(node) {
      node.setSelected(false);
    });
  }

  private saveUser(): void {
    this.userLoading = true;
    switch (this.userOption) {
      case 0:
        let saveParams: Object;
        if (!this.modelUser.email) {
          saveParams = {
            type: 'User', data: {
              // username: (this.modelUser.firstName + ' ' + this.modelUser.lastName).replace(/ /g, "_").toLowerCase(),
              username: this.modelUser.firstName + this.modelUser.phoneNumber,
              password: Math.random().toString(36).slice(-8),
              usertype: 1,
              nombre: this.modelUser.firstName,
              apellidos: this.modelUser.lastName,
              hasRegisteredPayment: false,
              cellPhoneNumber: this.modelUser.phoneNumber,
              callCenterUser: this._parseService.isLoggedIn()
            }
          };
        } else {
          saveParams = {
            type: 'User', data: {
              username: this.modelUser.email,
              email: this.modelUser.email,
              password: Math.random().toString(36).slice(-8),
              usertype: 1,
              nombre: this.modelUser.firstName,
              apellidos: this.modelUser.lastName,
              hasRegisteredPayment: false,
              cellPhoneNumber: this.modelUser.phoneNumber,
              callCenterUser: this._parseService.isLoggedIn()
            }
          };
        }
        this._parseService.saveObject(saveParams).then((userCreated: any) => {
          if (userCreated[0]) {
            this.selectedPasajero = JSON.parse(JSON.stringify(userCreated[1]));
            $('#modalUser').modal('hide');
            this.activeUser = false;
            this.createRowData();
            this._notificationService.onSuccess('Se creó usuario exitosamente!: ' + userCreated[1].get('nombre') + ' ' + userCreated[1].get('apellidos'), 100000);
          } else {
            switch (userCreated[1].code) {
              case 202:
                this._notificationService.onError('Usuario ya existe, cambialo e intenta de nuevo por favor.', 100000);
                break;

              case 203:
                this._notificationService.onError('Email ya existe, cambialo e intenta de nuevo por favor.', 100000);
                break;

              default:
                this._notificationService.onError('No se pudo crear usuario, intenta de nuevo por favor.', 100000);
                break;
            }
          }
          this.userLoading = false;
        });
        break;

      case 1:
        let cloudFunctionParams: any;
        if (this.modelUser.email) {
          cloudFunctionParams = {
            functionName: 'modifyUser', data: {
              userObjectId: this.modelUser.objectId,
              data: {
                nombre: this.modelUser.firstName,
                apellidos: this.modelUser.lastName,
                cellPhoneNumber: this.modelUser.phoneNumber,
                email: this.modelUser.email
              }
            }
          };
        } else {
          cloudFunctionParams = {
            functionName: 'modifyUser', data: {
              userObjectId: this.modelUser.objectId,
              data: {
                nombre: this.modelUser.firstName,
                apellidos: this.modelUser.lastName,
                cellPhoneNumber: this.modelUser.phoneNumber
              }
            }
          };
        }
        this._parseService.cloudFunction(cloudFunctionParams).then((cloudFunctionResult: any) => {
          if (cloudFunctionResult[0]) {
            this.selectedPasajero = JSON.parse(JSON.stringify(cloudFunctionResult[1].data));
            $('#modalUser').modal('hide');
            this.activeUser = false;
            this.createRowData();
            this._notificationService.onSuccess('Se guardó usuario exitosamente!: ' + cloudFunctionResult[1].data.get('nombre') + ' ' + cloudFunctionResult[1].data.get('apellidos'), 100000);
          } else {
            this._notificationService.onError('No se pudo guardar el usuario, intenta de nuevo por favor.', 100000);
          }
          this.userLoading = false;
        });
        break;
    }
  }

  private validateEmail(email) {
    if (email.length == 0) {
      return 'none';
    } else {
      let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (re.test(email)) {
        return '5px solid #42A948';
      } else {
        return '5px solid #a94442';
      }
    }
  }

  private clearModalInputs(): void {
    this.modelUser = new UserForm('', '', '', '');
  }

  public userForm(option: number, model?: any): void {
    this.activeUser = false;
    this.userOption = option;
    switch (option) {
      case 0:
        this.modelUser = new UserForm('', '', '', '');
        break;

      case 1:
        this.modelUser = new UserForm(model.nombre || '', model.apellidos || '', model.cellPhoneNumber || '', model.email || '', model.objectId);
        break;
    }
    this.activeUser = true;
    setTimeout(() => $('#modalUser').modal('show'), 0);
  }

  public selectMercado(mercado: any): void {
    this.mercadoSelected = mercado.nombre;
    this.mercadoIdSelected = mercado.objectId;
    this.lat = mercado.location[0];
    this.lng = mercado.location[1];
  }

  public clearInput(inputType: string): void {
    switch (inputType) {
      case 'userSearch':
        delete this.selectedPasajero;
        $('#inputSearchInput').val('');
        this.gridOptions.api.setQuickFilter('');
        this.gridOptions.api.forEachNode(function(node) {
          node.setSelected(false);
        });
        break;

      case 'originSearch':
        for (let i = 0; i < this.markers.length; i++) {
          if (this.markers[i].type == 'origin') {
            this.markers.splice(i, 1);
          }
        }
        delete this.origin;
        $('#directionsOrigin').val('');
        this.estimarTarifaTiempoViaje();
        break;

      case 'destinationSearch':
        for (let i = 0; i < this.markers.length; i++) {
          if (this.markers[i].type == 'destination') {
            this.markers.splice(i, 1);
          }
        }
        delete this.destination;
        $('#directionsDestination').val('');
        this.estimarTarifaTiempoViaje();
        break;
    }
  }

  // TODO: Fix dynamic map zoom
  private autocomplete(): void {
    this._loader.load().then(() => {
      let autocompleteOptions = { componentRestrictions: { country: "mx" } };

      let autocompleteOrigin = new google.maps.places.Autocomplete(document.getElementById("directionsOrigin"), autocompleteOptions);
      google.maps.event.addListener(autocompleteOrigin, 'place_changed', () => {
        let placeOrigin = autocompleteOrigin.getPlace();
        if (this.origin) {
          for (let i = 0; i < this.markers.length; i++) {
            if (this.markers[i].type == 'origin') {
              this.markers[i] = {
                type: this.markers[i].type,
                lat: placeOrigin.geometry.location.lat(),
                lng: placeOrigin.geometry.location.lng(),
                url: this.markers[i].url,
                draggable: this.markers[i].draggable
              };
            }
          }
        } else {
          this.markers.push({
            type: 'origin',
            lat: placeOrigin.geometry.location.lat(),
            lng: placeOrigin.geometry.location.lng(),
            url: "../../../assets/glyphicons-243-map-marker.png",
            draggable: true,
          });

        }
        this.origin = [placeOrigin.geometry.location.lat(), placeOrigin.geometry.location.lng()];
        this.originPlace = placeOrigin.name;
        this.estimarTarifaTiempoViaje();
        this.lat = placeOrigin.geometry.location.lat();
        this.lng = placeOrigin.geometry.location.lng();
        this.zoom = 17;
      });

      let autocompleteDestination = new google.maps.places.Autocomplete(document.getElementById("directionsDestination"), autocompleteOptions);
      google.maps.event.addListener(autocompleteDestination, 'place_changed', () => {
        let placeDestination = autocompleteDestination.getPlace();
        if (this.destination) {
          for (let i = 0; i < this.markers.length; i++) {
            if (this.markers[i].type == 'destination') {
              this.markers[i] = {
                type: this.markers[i].type,
                lat: placeDestination.geometry.location.lat(),
                lng: placeDestination.geometry.location.lng(),
                url: this.markers[i].url,
                draggable: this.markers[i].draggable
              };
            }
          }
        } else {
          this.markers.push({
            type: 'destination',
            lat: placeDestination.geometry.location.lat(),
            lng: placeDestination.geometry.location.lng(),
            url: "../../../assets/glyphicons-267-flag.png",
            draggable: true,
          });
        }
        this.destination = [placeDestination.geometry.location.lat(), placeDestination.geometry.location.lng()];
        this.destinationPlace = placeDestination.name;
        this.estimarTarifaTiempoViaje();
        this.lat = placeDestination.geometry.location.lat();
        this.lng = placeDestination.geometry.location.lng();
        this.zoom = 17;
      });
    });
  }

  public directionsDestinationChanged($event: any): void {
    $('#directionsDestination').css({ 'border-color': '#7fdb00' });
  }

  public directionsOriginChanged($event: any): void {
    $('#directionsOrigin').css({ 'border-color': '#7fdb00' });
  }

  public onSelectedServicio(servicioSelected: string): void {
    this.servicioSelected = servicioSelected;
    this.estimarTarifaTiempoViaje();
  }

  private clickedMarker(marker: MarkerLocation, index: number): void {
    this.markers.splice(index, 1);
    if (marker.type == 'origin') {
      delete this.origin;
      $('#directionsOrigin').val('');
    } else if (marker.type == 'destination') {
      delete this.destination;
      $('#directionsDestination').val('');
    }
    this.estimarTarifaTiempoViaje();
  }

  public mapClicked($event: MouseEvent): void {
    switch (this.markers.length) {
      case 0:
        this.markers.push({
          type: 'origin',
          lat: $event.coords.lat,
          lng: $event.coords.lng,
          url: "../../../assets/glyphicons-243-map-marker.png",
          draggable: true,
        });
        $('#directionsOrigin').css({ 'border-color': '#7fdb00' });
        this.origin = [$event.coords.lat, $event.coords.lng];
        this.geocodeLatLng($event.coords.lat, $event.coords.lng, 'origin');
        break;

      case 1:
        if (this.markers[0].type == 'origin') {
          this.markers.push({
            type: 'destination',
            lat: $event.coords.lat,
            lng: $event.coords.lng,
            url: "../../../assets/glyphicons-267-flag.png",
            draggable: true,
          });
          $('#directionsDestination').css({ 'border-color': '#7fdb00' });
          this.destination = [$event.coords.lat, $event.coords.lng];
          this.geocodeLatLng($event.coords.lat, $event.coords.lng, 'destination');
        } else if (this.markers[0].type == 'destination') {
          this.markers.push({
            type: 'origin',
            lat: $event.coords.lat,
            lng: $event.coords.lng,
            url: "../../../assets/glyphicons-243-map-marker.png",
            draggable: true,
          });
          $('#directionsOrigin').css({ 'border-color': '#7fdb00' });
          this.origin = [$event.coords.lat, $event.coords.lng];
          this.geocodeLatLng($event.coords.lat, $event.coords.lng, 'origin');
        }
        break;
    }
    this.lat = $event.coords.lat;
    this.lng = $event.coords.lng;
    this.zoom = 17;
    this.estimarTarifaTiempoViaje();
  }

  public addFromNotification(): void {

    let queryParams = { className: 'User', objectId: this.noDriverAvailableUser.userId, search: 'get' };
    this._parseService.query(queryParams).then((userResponse: any) => {
      if (userResponse[0]) {
        this.selectedPasajero = JSON.parse(JSON.stringify(userResponse[1]));
        this.createRowData();
      }
    });

    this.markers.push({
      type: 'origin',
      lat: this.noDriverAvailableUser.originLatitude,
      lng: this.noDriverAvailableUser.originLongitude,
      url: "../../../assets/glyphicons-243-map-marker.png",
      draggable: true,
    });
    $('#directionsOrigin').css({ 'border-color': '#7fdb00' });
    this.origin = [this.noDriverAvailableUser.originLatitude, this.noDriverAvailableUser.originLongitude];
    this.geocodeLatLng(this.noDriverAvailableUser.originLatitude, this.noDriverAvailableUser.originLongitude, 'origin');

    this.markers.push({
      type: 'destination',
      lat: this.noDriverAvailableUser.destinationLatitude,
      lng: this.noDriverAvailableUser.destinationLongitude,
      url: "../../../assets/glyphicons-267-flag.png",
      draggable: true,
    });
    $('#directionsDestination').css({ 'border-color': '#7fdb00' });
    this.destination = [this.noDriverAvailableUser.destinationLatitude, this.noDriverAvailableUser.destinationLongitude];
    this.geocodeLatLng(this.noDriverAvailableUser.destinationLatitude, this.noDriverAvailableUser.destinationLongitude, 'destination');

  }

  private markerDragEnd(marker: MarkerLocation, index: number, $event: MouseEvent): void {
    // console.log('dragEnd', marker, $event);
    switch (marker.type) {
      case 'origin':
        this.markers[index] = {
          type: this.markers[index].type,
          lat: $event.coords.lat,
          lng: $event.coords.lng,
          url: this.markers[index].url,
          draggable: this.markers[index].draggable
        };
        this.origin = [$event.coords.lat, $event.coords.lng];
        this.geocodeLatLng($event.coords.lat, $event.coords.lng, 'origin');
        break;

      case 'destination':
        this.markers[index] = {
          type: this.markers[index].type,
          lat: $event.coords.lat,
          lng: $event.coords.lng,
          url: this.markers[index].url,
          draggable: this.markers[index].draggable
        };
        this.destination = [$event.coords.lat, $event.coords.lng];
        this.geocodeLatLng($event.coords.lat, $event.coords.lng, 'destination');
        break;
    }
    this.lat = $event.coords.lat;
    this.lng = $event.coords.lng;
    this.zoom = 17;
    this.estimarTarifaTiempoViaje();
  }

  private geocodeLatLng(lat: number, lng: number, type: string): void {
    this._loader.load().then(() => {
      let self = this;
      let geocoder = new google.maps.Geocoder;
      geocoder.geocode({ 'location': { lat: lat, lng: lng } }, function(results: any, status: any) {
        if (status === google.maps.GeocoderStatus.OK) {
          // console.log('Direccion: ', results);
          if (type == 'origin') {
            $('#directionsOrigin').val(results[0].formatted_address);
            self.originPlace = results[1].formatted_address;
          } else if (type == 'destination') {
            $('#directionsDestination').val(results[0].formatted_address);
            self.destinationPlace = results[1].formatted_address;
          }
        } else {
          // console.log('Geocoder failed due to: ' + status);
          if (type == 'origin') {
            self._notificationService.onError('No se encontró el nombre de la dirección de origen, por favor escogala de nuevo si desea que la dirección aparezca.', 1031);
            $('#directionsOrigin').val('Nombre no encontrado');
            delete self.origin;
          } else if (type == 'destination') {
            self._notificationService.onError('No se encontró el nombre de la dirección de destino, por favor escogala de nuevo si desea que la dirección aparezca.', 1031);
            $('#directionsDestination').val('Nombre no encontrado');
            delete self.destination;
          }
        }
      });
    });
  }

  private getMercadoAndServicio(): void {
    let queryParams = {
      className: 'IterMercados',
      search: 'find'
    };
    this._parseService.query(queryParams).then((result: any) => {
      if (result[0]) {
        this.mercados = JSON.parse(JSON.stringify(result[1]));
      }
    });
    queryParams = {
      className: 'IterTipoServicio',
      search: 'find'
    };
    this._parseService.query(queryParams).then((result: any) => {
      if (result[0]) {
        this.servicios = JSON.parse(JSON.stringify(result[1]));
      }
    });
  }

  private estimarTarifaTiempoViaje(): void {
    if (this.origin && this.destination && this.servicioSelected && this.mercadoIdSelected) {
      let cloudFunctionParams = {
        functionName: 'estimarTarifaTiempo', data: {
          isCallCenter: true,
          originLat: this.origin[0],
          originLng: this.origin[1],
          destinationLat: this.destination[0],
          destinationLng: this.destination[1],
          serviceType: 'Iter ' + this.servicioSelected,
          mercadoId: this.mercadoIdSelected
        }
      };
      this._parseService.cloudFunction(cloudFunctionParams).then((cloudFunctionResult: any) => {
        if (cloudFunctionResult[0]) {
          this.tarifaEstimada = Number(cloudFunctionResult[1].tarifaEstimada);
          this.tiempoViaje = cloudFunctionResult[1].tiempoViaje;
        } else {
          this.tarifaEstimada = 0;
          this.tiempoViaje = "0 mins";
        }
      });
    } else {
      this.tarifaEstimada = 0;
      this.tiempoViaje = "0 mins";
    }
  }

  private driverIconColor(status: number, objectId: string) {
    if (this.viaje) {
      if (this.viaje.asignacion.objectId == objectId) {
        return '../../../assets/glyphicons-569-requesttaxi.png';
      } else {
        switch (status) {
          case 0:
            return '../../../assets/glyphicons-569-offlinetaxi.png';

          case 1:
            return '../../../assets/glyphicons-569-taxi.png';

          case 2:
            return '../../../assets/glyphicons-569-ontriptaxi.png';
        }
      }
    } else {
      switch (status) {
        case 0:
          return '../../../assets/glyphicons-569-offlinetaxi.png';

        case 1:
          return '../../../assets/glyphicons-569-taxi.png';

        case 2:
          return '../../../assets/glyphicons-569-ontriptaxi.png';
      }
    }
  }

  public getDrivers(): void {
    setTimeout(() => {
      let onlineDrivers = [];
      let offlineDrivers = [];
      let ontripDrivers = [];
      let filter = [];
      if (this.driversFilter.offline) {
        filter.push(0);
      }
      if (this.driversFilter.online) {
        filter.push(1);
      }
      if (this.driversFilter.ontrip) {
        filter.push(2);
      }
      let queryParams = {
        className: 'Asignacion',
        constraints: {
          containedIn: { status: filter },
          exists: ['lastLocation'],
          include: ['chofer', 'vehiculo']
        },
        search: 'find'
      };
      this._parseService.query(queryParams).then((result: any) => {
        if (result[0]) {
          this.drivers = JSON.parse(JSON.stringify(result[1]));

          for (let i = 0; i < this.drivers.length; i++) {
            switch (this.drivers[i].status) {
              case 0:
                offlineDrivers.push(this.drivers[i]);
                break;

              case 1:
                onlineDrivers.push(this.drivers[i]);
                break;

              case 2:
                ontripDrivers.push(this.drivers[i]);
                break;
            }
          }

          this.onlineDrivers = onlineDrivers;
          this.offlineDrivers = offlineDrivers;
          this.ontripDrivers = ontripDrivers;

        } else {
          this.onlineDrivers = [];
          this.offlineDrivers = [];
          this.ontripDrivers = [];
        }
      });
    }, 0);
  }

  private addEventListener(): void {
    let self = this;
    this.pubnub.addListener({
      status: function(statusEvent: any) {
        // console.log('Status event:', statusEvent);
      },
      message: function(message: any) {
        // console.log('Channel', message.subscribedChannel, ':', message.message);
        let queryParams;
        switch (message.message.message) {
          case 'drvrCnfirm':
            queryParams = { className: 'Viaje', constraints: { equalTo: { objectId: message.message.viajeID }, include: ['asignacion.chofer', 'asignacion.vehiculo'] }, search: 'first' };
            self._parseService.query(queryParams).then((viajeResponse: any) => {
              if (viajeResponse[0]) {
                self.viaje = JSON.parse(JSON.stringify(viajeResponse[1]));
                self.loading = false;
                self.tripAsigned = true;
                self.estimarTiempoLlegada();
                setTimeout(() => {
                  // TODO: check animate
                  $('html, body').animate({ scrollTop: $("#summaryContainer").offset().top - 350 }, 1000);
                }, 0);
              } else {
                self._notificationService.onError('No se pudo obtener el viaje.', 100000);
              }
            });
            break;

          case 'tripRequest':
            queryParams = { className: 'Viaje', constraints: { equalTo: { objectId: message.message.viajeObjectId }, include: ['asignacion.chofer', 'asignacion.vehiculo'] }, search: 'first' };
            self._parseService.query(queryParams).then((viajeResponse: any) => {
              if (viajeResponse[0]) {
                self.viaje = JSON.parse(JSON.stringify(viajeResponse[1]));
                self._notificationService.onTryAgain('Seguimos buscando un chofer, espere por favor.', 100000);
                self.getDrivers();
                self.asignacionRequestedAlert();
              } else {
                self._notificationService.onError('No se pudo obtener el viaje.', 100000);
              }
            });
            break;

          case 'tripCancelled':
            if (message.message.cancelBy == 'server') {
              self.unsubscribe([self.viaje.objectId]);
              self.loading = false;
              self.tripRequested = false;
              self.getDrivers();
              self._notificationService.onWarning('Nuestros iters se encuentran ocupados, por favor intenta de nuevo.', 100000);
              delete self.viaje;
            }
            break;

          case 'No driver available':
            self._notificationService.alert({
              options: {
                icon: 'glyphicon glyphicon-warning-sign',
                title: '<strong>Solicitud de viaje sin vehículo disponible:</strong>',
                message: '<p>' +
                'Nombre de cliente: <strong>' + message.message.userName + '</strong><br>' +
                'Telefono celular: <strong>' + message.message.userPhone + '</strong><br>' +
                'Origen: <strong>' + message.message.userOriginPlace + '</strong><br>' +
                'Destino: <strong>' + message.message.userDestinationPlace + '</strong>' +
                '</p>'
              },
              settings: {
                type: 'danger',
                delay: 0,
                z_index: 100000,
                onClose: function() {
                  for (let i = 0; i < self.requestsWithNoDriver.length; i++) {
                    if (self.requestsWithNoDriver[i].userId == message.message.userId) {
                      self.noDriverAvailableUser = self.requestsWithNoDriver[i];
                      self.requestsWithNoDriver.splice(i, 1);
                      $('#modalAutoLLenar').modal('show');
                      break;
                    }
                  }
                }
              }
            });

            self.requestsWithNoDriver.push({
              userId: message.message.userId,
              originLatitude: message.message.userOrigin[0],
              originLongitude: message.message.userOrigin[1],
              destinationLatitude: message.message.userDestination[0],
              destinationLongitude: message.message.userDestination[1],
              iconUrl: "../../../assets/glyphicons-person-red.png",
              userName: message.message.userName,
              userPhone: message.message.userPhone,
              userOriginPlace: message.message.userOriginPlace,
              userDestinationPlace: message.message.userDestinationPlace
            });
            break;
        }
      }
    });
  }

  private asignacionRequestedAlert(): void {
    this._notificationService.alert({
      options: {
        icon: 'glyphicon glyphicon-envelope',
        title: '<strong>Viaje solicitado a:</strong>',
        message: '<p>' +
        'Chofer: <strong>' + this.viaje.asignacion.chofer.nombre + ' ' + this.viaje.asignacion.chofer.apellidos + '</strong><br>' +
        'Telefono celular: <strong>' + this.viaje.asignacion.chofer.telCelular + '</strong><br>' +
        'Marca del vehiculo: <strong>' + this.viaje.asignacion.vehiculo.marca + '</strong><br>' +
        'Modelo del vehiculo: <strong>' + this.viaje.asignacion.vehiculo.modelo + '</strong><br>' +
        'Color del vehiculo: <strong>' + this.viaje.asignacion.vehiculo.color + '</strong><br>' +
        'Placas del vehiculo: <strong>' + this.viaje.asignacion.vehiculo.placa + '</strong>' +
        '</p>'
      },
      settings: {
        delay: 10000,
        z_index: 100000
      }
    });
  }

  public requestCloser(): void {
    if (this.selectedPasajero && this.origin && this.destination) {
      this.loading = true;

      // TODO: hacer request por tipo de servicio

      let cloudFunctionParams = {
        functionName: 'tripRequest', data: {
          callCenterUserId: this._parseService.isLoggedIn().id,
          user: this.selectedPasajero.objectId,
          originLat: this.origin[0],
          originLng: this.origin[1],
          destinationLat: this.destination[0],
          destinationLng: this.destination[1],
          requestedFrom: 0,
          paymentType: 0,
          userOriginPlace: this.originPlace,
          userDestinationPlace: this.destinationPlace,
        }
      };
      this._parseService.cloudFunction(cloudFunctionParams).then((viajeId: any) => {
        if (viajeId[0]) {
          let queryParams = { className: 'Viaje', constraints: { equalTo: { objectId: viajeId[1] }, include: ['asignacion.chofer', 'asignacion.vehiculo'] }, search: 'first' };
          this._parseService.query(queryParams).then((viajeResponse: any) => {
            if (viajeResponse[0]) {
              this.viaje = JSON.parse(JSON.stringify(viajeResponse[1]));
              this._notificationService.onSuccess('Se creo viaje exitosamente!', 100000);
              this.tripRequested = true;
              this.getDrivers();
              this.asignacionRequestedAlert();
              // console.log("Subscribing..");
              this.pubnub.subscribe({
                channels: [this.viaje.objectId]
              });
            } else {
              this._notificationService.onError('No se pudo obtener el viaje.', 100000);
              this.loading = false;
            }
          });
        } else {
          this._notificationService.onError('No se pudo crear el viaje, intenta de nuevo por favor.', 100000);
          this.loading = false;
        }
      });

    } else {
      if (!this.selectedPasajero) {
        $('#inputSearchInput').css({ "border": '#FF0000 5px solid' });
        $('#agGrid').css({ "border": '#FF0000 5px solid' });
        this._notificationService.onError('Verifique que haya seleccionado al pasajero e intente de nuevo.', 100000);
      }
      if (!this.origin) {
        $('#directionsOrigin').css({ "border": '#FF0000 5px solid' });
        this._notificationService.onError('Verifique que haya seleccionado el origen e intente de nuevo.', 100000);
      }
      if (!this.destination) {
        $('#directionsDestination').css({ "border": '#FF0000 5px solid' });
        this._notificationService.onError('Verifique que haya seleccionado el destino e intente de nuevo.', 100000);
      }
    }
  }

  private cancelTrip(): void {
    let cloudFunctionParams = {
      functionName: 'cancelTripRequest', data: {
        viajeObjID: this.viaje.objectId,
        cancelBy: 'callCenter'
      }
    };
    this._parseService.cloudFunction(cloudFunctionParams).then((response: any) => {
      if (response[0]) {
        this._notificationService.onSuccess('Se canceló el viaje. ', 100000);
        this.unsubscribe([this.viaje.objectId]);
        this.loading = false;
        this.tripRequested = false;
        this.getDrivers();
        // TODO: check animate
        $('html, body').animate({ scrollTop: $("#searchContainer").offset().top - 80 }, 1000);
        setTimeout(() => {
          this.tripAsigned = false;
          delete this.viaje;
        }, 1000);
      } else {
        this._notificationService.onError('No se pudo cancelar el viaje, por favor intenta de nuevo.', 100000);
      }
    });
  }

  private estimarTiempoLlegada(): void {
    let self = this;
    let request = {
      origin: new google.maps.LatLng(this.viaje.asignacion.lastLocation.latitude, this.viaje.asignacion.lastLocation.longitude),
      destination: new google.maps.LatLng(this.origin[0], this.origin[1]),
      travelMode: google.maps.TravelMode.DRIVING
    };
    new google.maps.DirectionsService().route(request, function(result: any, status: any) {
      if (status == google.maps.DirectionsStatus.OK) {
        // console.log('Duration to user:', result.routes[0].legs[0].duration);
        self.tiempoLlegada = result.routes[0].legs[0].duration.text;
      }
    });
  }

  private finalize(): void {
    let self = this;
    // TODO: check animate
    $('html, body').animate({ scrollTop: $("#searchContainer").offset().top - 80 }, 1000);
    setTimeout(function() {
      self.lat = 19.2856391;
      self.lng = -99.6130955;
      self.zoom = 13;
      self.markers = [];
      self.servicioSelected = 'Clásico';
      self.pago = 'Efectivo';
      self.tiempoLlegada = "0 mins";
      self.unsubscribe([self.viaje.objectId]);
      delete self.selectedPasajero;
      delete self.viaje;
      delete self.origin;
      delete self.destination;
      self.estimarTarifaTiempoViaje();
      delete self.originPlace;
      delete self.destinationPlace;
      $('#inputSearchInput').val('');
      $('#directionsOrigin').val('');
      $('#directionsDestination').val('');
      self.gridOptions.api.setQuickFilter('');
      self.gridOptions.api.forEachNode(function(node) {
        node.setSelected(false);
      });
      self.tripAsigned = false;
      self.tripRequested = false;
    }, 1000);
  }

  private unsubscribe(channel: Array<string>): void {
    // console.log('Unsubscribing from:', channel);
    this.pubnub.unsubscribe({
      channels: channel
    });
  }

}
