import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'status'
})
export class StatusPipe implements PipeTransform {

  transform(status: number, type: string): any {
      let statusString: string;
      switch (type) {
          case 'Viaje':
              switch (status) {
                  case 0:
                      statusString = 'Nuevo';
                      break;

                  case 1:
                      statusString = 'Empezado';
                      break;

                  case 2:
                      statusString = 'Terminado';
                      break;

                  case 3:
                      statusString = 'Cancelado';
                      break;
              }
              break;

          case 'requestedFrom':
              switch (status) {
                  case 0:
                      statusString = 'Call Center';
                      break;

                  case 1:
                      statusString = 'IOS';
                      break;

                  case 2:
                      statusString = 'Android';
                      break;

              }
              break;
      }
      return statusString;
  }

}
