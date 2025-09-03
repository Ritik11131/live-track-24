import {NgModule, Inject} from '@angular/core';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AppLayoutModule} from './layout/app.layout.module';
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {AuthInterceptorInterceptor} from "./service/auth-interceptor.interceptor";
import {DeviceStatusPipe} from "./rawdata/device-status.pipe";
import {BrowserModule} from '@angular/platform-browser';

import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {MessageService} from "primeng/api";
import {AngularFireModule} from "@angular/fire/compat";
import {AngularFirestoreModule} from "@angular/fire/compat/firestore";

@NgModule({
    imports: [
        AppLayoutModule,
        AppRoutingModule,
        BrowserModule,
        AngularFireModule.initializeApp({
            "projectId": "livetrack24-60ccc",
            "appId": "1:931807403540:web:1ccb78f54908f570471101",
            "storageBucket": "livetrack24-60ccc.appspot.com",
            "apiKey": "AIzaSyCZI7cVTWkIjhYPvFHwZ5R53ksQJiyJCts",
            "authDomain": "livetrack24-60ccc.firebaseapp.com",
            "messagingSenderId": "931807403540",
            "measurementId": "G-QJ241P288Q"
        }),
        AngularFirestoreModule
    ],
    declarations: [
        AppComponent,
    ],
    providers:
        [
            DeviceStatusPipe,
            MessageService,
            {provide: LocationStrategy, useClass: HashLocationStrategy},
            {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorInterceptor, multi: true},
            provideAnimationsAsync(),
        ],
    bootstrap:
        [AppComponent]
})

export class AppModule {

constructor(){}
}
 
