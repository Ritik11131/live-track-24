import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { AppConfigModule } from 'src/app/layout/config/config.module';
import { RippleModule } from 'primeng/ripple';
import {ReactiveFormsModule} from "@angular/forms";
import {ToastModule} from "primeng/toast";
import { GalleriaModule } from 'primeng/galleria';

@NgModule({
    imports: [
        GalleriaModule,
        CommonModule,
        LoginRoutingModule,
        ButtonModule,
        InputTextModule,
        RippleModule,
        AppConfigModule,
        ReactiveFormsModule,
        ToastModule
    ],
    declarations: [LoginComponent]
})
export class LoginModule { }
