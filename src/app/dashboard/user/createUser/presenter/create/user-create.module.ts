import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { userCreateComponent } from './user-create.component';
import { UserCreateRoutingModule } from './user-create-routing.module';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import {ToastModule} from "primeng/toast";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import { TabViewModule } from 'primeng/tabview';
import { ConfigurationDetailComponent } from "../../../configurationDetails/presenter/configuration-detail/configuration-detail.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        UserCreateRoutingModule,
        ButtonModule,
        RippleModule,
        InputTextModule,
        TabViewModule,
        DropdownModule,
        FileUploadModule,
        InputTextareaModule,
        InputGroupModule,
        InputGroupAddonModule,
        ReactiveFormsModule,
        ToastModule,
        ConfirmDialogModule,
        ConfigurationDetailComponent
    ],
	declarations: [userCreateComponent]
})
export class UserCreateModule { }
