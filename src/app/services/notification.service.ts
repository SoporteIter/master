import { Injectable } from '@angular/core';
declare var $: any;

@Injectable()
export class NotificationService {

  constructor() { }

  public alert(params: any): void {
    $.notify({
      // options
      icon: params.options.icon,
      title: params.options.title,
      message: params.options.message,
    }, {
      // settings
      type: params.settings.type || 'info',
      offset: 30,
      z_index: params.settings.z_index,
      delay: params.settings.delay || 0,
      animate: {
        enter: 'animated bounceIn',
        exit: 'animated bounceOut'
      },
      placement: {
        from: 'top',
        align: 'right'
      },
      onClose: params.settings.onClose || null,
      icon_type: 'class',
      template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
      '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
      '<span data-notify="icon"></span> ' +
      '<span data-notify="title">{1}</span> ' +
      '<span data-notify="message">{2}</span>' +
      '<div class="progress" data-notify="progressbar">' +
      '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
      '</div>' +
      '<a href="{3}" target="{4}" data-notify="url"></a>' +
      '</div>'
    });
  }

  public onSuccess(message: string, zIndex: number, icon?: string): void {
    $.notify({
      // options
      icon: icon || 'glyphicon glyphicon-ok',
      title: '<strong> Exito:</strong>',
      message: message
    }, {
      // settings
      offset: 30,
      z_index: zIndex,
      type: 'success',
      animate: {
        enter: 'animated bounceIn',
        exit: 'animated bounceOut'
      },
      icon_type: 'class',
      template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
      '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
      '<span data-notify="icon"></span>' +
      '<span data-notify="title">{1}</span> ' +
      '<span data-notify="message">{2}</span>' +
      '<div class="progress" data-notify="progressbar">' +
      '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
      '</div>' +
      '</div>'
    });
  }

  public onError(message: string, zIndex: number, icon?: string): void {
    $.notify({
      // options
      icon: icon || 'glyphicon glyphicon-remove',
      title: '<strong> Error:</strong>',
      message: message
    }, {
      // settings
      offset: 30,
      z_index: zIndex,
      type: 'danger',
      animate: {
        enter: 'animated bounceIn',
        exit: 'animated bounceOut'
      },
      icon_type: 'class',
      template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
      '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
      '<span data-notify="icon"></span>' +
      '<span data-notify="title">{1}</span> ' +
      '<span data-notify="message">{2}</span>' +
      '<div class="progress" data-notify="progressbar">' +
      '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
      '</div>' +
      '</div>'
    });
  }

  public onWarning(message: string, zIndex: number, icon?: string): void {
    $.notify({
      // options
      icon: icon || 'glyphicon glyphicon-warning-sign',
      title: '<strong> Advertencia:</strong>',
      message: message
    }, {
      // settings
      offset: 30,
      z_index: zIndex,
      type: 'warning',
      animate: {
        enter: 'animated bounceIn',
        exit: 'animated bounceOut'
      },
      icon_type: 'class',
      template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
      '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
      '<span data-notify="icon"></span>' +
      '<span data-notify="title">{1}</span> ' +
      '<span data-notify="message">{2}</span>' +
      '<div class="progress" data-notify="progressbar">' +
      '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
      '</div>' +
      '</div>'
    });
  }

  public onTryAgain(message: string, zIndex: number): void {
    $.notify({
      // options
      icon: 'glyphicon glyphicon-repeat',
      title: '<strong> Información:</strong>',
      message: message
    }, {
      // settings
      offset: 30,
      z_index: zIndex,
      type: 'info',
      animate: {
        enter: 'animated bounceIn',
        exit: 'animated bounceOut'
      },
      icon_type: 'class',
      template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
      '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
      '<span data-notify="icon"></span>' +
      '<span data-notify="title">{1}</span> ' +
      '<span data-notify="message">{2}</span>' +
      '<div class="progress" data-notify="progressbar">' +
      '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
      '</div>' +
      '</div>'
    });
  }

}
