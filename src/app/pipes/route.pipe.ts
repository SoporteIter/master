import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'route'
})
export class RoutePipe implements PipeTransform {

  transform(route: string): any {
      switch (route) {
          case '/resumen':
              return 'Resumen';

          case '/activos':
              return 'Activos';

          case '/monitoreo':
              return 'Monitoreo de activos';

          case '/tarifa':
              return 'Tarifa';

          case '/viajes':
              return 'Viajes';

          default:
              return '';
      }
  }

}
