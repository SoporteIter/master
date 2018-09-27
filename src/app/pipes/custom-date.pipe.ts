import { Pipe, PipeTransform } from '@angular/core';
declare var moment: any;

@Pipe({
  name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {

  transform(date: string, options: string): any {
      let data: any;
      switch (options) {
          case 'LL':
              data = moment(date).locale('es').format('LL');
              break;

          case 'LT':
              data = moment(date).locale('es').format('LT');
              break;

          case 'ddddLL':
              data = moment(date).locale('es').format('dddd') + ', ' + moment(date).locale('es').format('LL');
              break;
      }
      return data;
  }

}
