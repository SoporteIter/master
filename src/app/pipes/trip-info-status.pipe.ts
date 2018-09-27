import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
declare var moment: any;

@Pipe({
  name: 'tripInfoStatus'
})
export class TripInfoStatusPipe implements PipeTransform {

  constructor(
    private _sanitizer: DomSanitizer
  ) { }

  private requestedFrom(requestedFrom: number): string {
    switch (requestedFrom) {
      case 0:
        return 'call center';

      case 1:
        return 'ios';

      case 2:
        return 'android';
    }
  }

  transform(content: any): any {
    // console.log(moment(content.createdAt).locale('es').fromNow(true));
    // console.log(moment().diff(moment(content.createdAt),'minutes'));

    let diff = moment().diff(moment(content.createdAt), 'minutes');
    let dataString =
      '<span class="badge">' + moment(content.createdAt).locale('es').fromNow() + '</span>' +
      '<span class="badge">' + this.requestedFrom(content.requestedFrom) + '</span>' +
      '<br>' +
      '<i class="fa fa-taxi" aria-hidden="true"></i> ' + content.asignacion.chofer.nombre + ' ' + content.asignacion.chofer.apellidos +
      '<ul>' +
      '<li>' + '<i class="fa fa-phone" aria-hidden="true"></i> ' + content.asignacion.chofer.telCelular + '</li>' +
      '<li>' + content.asignacion.vehiculo.marca + '</li>' +
      '<li>' + content.asignacion.vehiculo.modelo + '</li>' +
      '<li>' + content.asignacion.vehiculo.color + '</li>' +
      '<li>' + content.asignacion.vehiculo.placas + '</li>' +
      '</ul>' +
      '<i class="fa fa-male" aria-hidden="true"></i> ' + content.pasajero.nombre + ' ' + content.pasajero.apellidos +
      '<ul>' +
      '<li>' + '<i class="fa fa-phone" aria-hidden="true"></i> ' + content.pasajero.cellPhoneNumber + '</li>' +
      '</ul>';

    if (diff >= 0 && diff < 10) {
      return this._sanitizer.bypassSecurityTrustHtml('<li class="list-group-item list-group-item-info">' + dataString + '</li>');
    } else if (diff >= 10 && diff < 20) {
      return this._sanitizer.bypassSecurityTrustHtml('<li class="list-group-item list-group-item-warning">' + dataString + '</li>');
    } else if (diff >= 20) {
      return this._sanitizer.bypassSecurityTrustHtml('<li class="list-group-item list-group-item-danger">' + dataString + '</li>');
    }
  }

}
