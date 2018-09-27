import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

// Components
import { AppComponent } from './app.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { ActivosComponent } from './components/activos/activos.component';
import { MonitoreoComponent } from './components/monitoreo/monitoreo.component';
import { ResumenComponent } from './components/resumen/resumen.component';
import { TarifaComponent } from './components/tarifa/tarifa.component';
import { ViajesComponent } from './components/viajes/viajes.component';
import { MonitoreoViajesComponent } from './components/viajes/monitoreo-viajes/monitoreo-viajes.component';

// Services
import { ParseService } from './services/parse.service';
import { NotificationService } from './services/notification.service';
import { SessionRouterService } from './services/session-router.service';

// Pipes
import { CustomDatePipe } from './pipes/custom-date.pipe';
import { RoutePipe } from './pipes/route.pipe';
import { StatusPipe } from './pipes/status.pipe';
import { TripInfoStatusPipe } from './pipes/trip-info-status.pipe';

// Other libraries
import { AgmCoreModule } from 'angular2-google-maps/core';
import { AgGridModule } from 'ag-grid-ng2/main';

@NgModule({
  declarations: [
    AppComponent,
    SignInComponent,
    ActivosComponent,
    MonitoreoComponent,
    ResumenComponent,
    TarifaComponent,
    ViajesComponent,
    MonitoreoViajesComponent,
    CustomDatePipe,
    RoutePipe,
    StatusPipe,
    TripInfoStatusPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AgmCoreModule.forRoot({
      //apiKey: 'AIzaSyCb0JMdOYWeLrHxA5FdLlgKrKOvXVQC4jY',
      apiKey: 'AIzaSyAbL2grt8AlkHl9aiFqcWjLARhGPwmN6OQ',
      language: 'es',
      libraries: ['places']
    }),
    AgGridModule.withComponents(
      [
        ViajesComponent
      ]),
    RouterModule.forRoot([
      {
        path: '',
        redirectTo: 'resumen',
        pathMatch: 'full'
      },
      {
        path: 'activos',
        component: ActivosComponent
      },
      {
        path: 'viajes',
        component: ViajesComponent
      },
      {
        path: 'sign-in',
        component: SignInComponent
      },
      {
        path: 'resumen',
        component: ResumenComponent,
      },
      {
        path: 'tarifa',
        component: TarifaComponent
      },
      {
        path: 'monitoreo',
        component: MonitoreoComponent
      }
      /*{
      path: 'historial',
      component: HistorialComponent
    },
    {
    path: 'codigos-promociones',
    component: CodigosPromocionesComponent
  },
  {
  path: 'facturacion',
  component: FacturacionComponent
}*/
    ])
  ],
  providers: [
    ParseService,
    NotificationService,
    SessionRouterService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
