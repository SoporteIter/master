import { Injectable } from '@angular/core';
import { ParseService } from '../services/parse.service';
import { Router } from '@angular/router';

@Injectable()
export class SessionRouterService {

  constructor(
      private _router: Router,
      private _parseService: ParseService
  ) { }

  public sessionRouter(route: string): void {
      let loggedIn = this._parseService.isLoggedIn();
      switch (route) {
          case 'Activos':
          case 'Monitoreo':
          case 'Resumen':
          case 'Tarifa':
              if (loggedIn) {
                  switch (loggedIn.get('usertype')) {
                      case 0:
                          break;

                      case 1:
                      case 2:
                          this._parseService.signOut();
                          this._router.navigate(['/sign-in']);
                          break;

                      case 3:
                          this._router.navigate(['/viajes']);
                          break;
                  }
              } else {
                  this._router.navigate(['/sign-in']);
              }
              break;

          case 'SignIn':
              if (loggedIn) {
                  switch (loggedIn.get('usertype')) {
                      case 0:
                          this._router.navigate(['/resumen']);
                          break;

                      case 1:
                      case 2:
                          this._parseService.signOut();
                          break;

                      case 3:
                          this._router.navigate(['/viajes']);
                          break;
                  }
              }
              break;

          case 'Viajes':
              if (loggedIn) {
                  switch (loggedIn.get('usertype')) {
                      case 0:
                          this._router.navigate(['/resumen']);
                          break;

                      case 1:
                      case 2:
                          this._parseService.signOut();
                          this._router.navigate(['/sign-in']);
                          break;

                      case 3:
                          break;
                  }
              } else {
                  this._router.navigate(['/sign-in']);
              }
              break;
      }
  }

}
