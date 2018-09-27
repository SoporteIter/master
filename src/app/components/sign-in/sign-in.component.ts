import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ParseService } from '../../services/parse.service';
import { NotificationService } from '../../services/notification.service';
import { SessionRouterService } from '../../services/session-router.service';
import { AppComponent } from '../../app.component';
import { SignInForm } from '../../classes/form';
declare var $: any;

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
    public loading: boolean;
    public modelSignIn = new SignInForm('', '');

    constructor(
        private _parseService: ParseService,
        private _notificationService: NotificationService,
        private _router: Router,
        private _appComponent: AppComponent,
        private _sessionRouterService: SessionRouterService
    ) { }

    ngOnInit(): void {
        // console.log("SignInComponent running");
        this._sessionRouterService.sessionRouter('SignIn');
        this.loading = false;
        let images = ['cover1.gif', 'cover2.gif', 'cover3.gif'];
        $('.site-wrapper').css({ 'background-image': 'url(../../../assets/' + images[Math.floor(Math.random() * images.length)] + ')' });
    }

    ngOnDestroy(): void {
        // console.log('SignInComponent destroying');
    }

    // TODO: Fix stucked view when signing in
    public signIn(): void {
        this.loading = true;
        this._parseService.signIn(this.modelSignIn.username, this.modelSignIn.password).then((result: any) => {
            if (result[0]) {
                switch (result[1].get('usertype')) {
                    case 0:
                        this._appComponent.onLoggedIn({ onsession: true, usertype: 0, userName: result[1].get("nombre"), title: 'Iter Admin' });
                        this._notificationService.onSuccess('Iniciaste sesión. ', 100000);
                        this._router.navigate(['/resumen']);
                        break;

                    case 1:
                    case 2:
                        this._parseService.signOut();
                        this._notificationService.onError('Usuario/Contraseña invalido, intenta de nuevo.', 100000);
                        break;

                    case 3:
                        this._appComponent.onLoggedIn({ onsession: true, usertype: 3, userName: result[1].get("nombre"), title: 'Call Center' });
                        this._notificationService.onSuccess('Iniciaste sesión. ', 100000);
                        this._router.navigate(['/viajes']);
                        break;
                }
            } else {
                switch (result[1].code) {
                    case 101:
                        this._notificationService.onError('Usuario/Contraseña invalido, intenta de nuevo.', 100000);
                        break;

                    case 100:
                        this._notificationService.onError('Revisa tu conexión a internet e intenta de nuevo.', 100000);
                        break;

                    default:
                        this._notificationService.onError(result[1].message, 100000);
                        break;
                }
            }
            this.loading = false;
        });
    }
}
