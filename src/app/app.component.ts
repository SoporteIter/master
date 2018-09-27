import { Component, OnInit } from '@angular/core';
import { ParseService } from './services/parse.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    private title: string;
    public onSession: any;
    private user: any;
    private userType: number;

    constructor(
        private _router: Router,
        private _parseService: ParseService
    ) { }

    ngOnInit(): void {
        // console.log("AppComponent running");
        let loggedIn = this._parseService.isLoggedIn();
        if (loggedIn) {
            this.onSession = true;
            this.user = loggedIn.get("nombre");
            switch (loggedIn.get('usertype')) {
                case 0:
                    this.title = 'Iter Admin';
                    this.userType = 0;
                    break;

                case 3:
                    this.title = 'Call Center';
                    this.userType = 3;
                    break;
            }
        } else {
            this.onSession = false;
        }

    }

    ngOnDestroy(): void {
        // console.log('AppComponent destroying');
    }

    private signOut(): void {
        this._parseService.signOut().then((result: any) => {
            if (result[0]) {
                this.onSession = false;
                this._router.navigate(['/sign-in']);
            }
        });
    }

    public onLoggedIn(data: any): void {
        this.title = data.title;
        this.onSession = data.onsession;
        this.user = data.userName;
        this.userType = data.usertype;
    }
}
