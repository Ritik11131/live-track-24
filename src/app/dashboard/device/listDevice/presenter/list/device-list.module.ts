import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { DeviceListComponent } from './device-list.component';
import { DeviceListRoutingModule } from './device-list-routing.module';
import {ToastModule} from "primeng/toast";
import {DropdownModule} from "primeng/dropdown";
import {FormsModule} from "@angular/forms";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {TooltipModule} from "primeng/tooltip";
import { SkeletonModule } from 'primeng/skeleton';
import { UpdateComponent } from "../../../updateDevice/presenter/update/update.component";
import { MenuModule } from 'primeng/menu';

import { FileUploadComponent } from "../../../fileUpload/presenter/file-upload/file-upload.component";
import { LinkUserComponent } from './linkDevice/presenter/link-user/link-user.component';
@NgModule({
    imports: [
        CommonModule,
        DeviceListRoutingModule,
        RippleModule,
        ButtonModule,
        InputTextModule,
        MenuModule,
        FileUploadComponent,
        UpdateComponent,
        TableModule,
        ProgressBarModule,
        ToastModule,
        DropdownModule,
        FormsModule,
        ConfirmDialogModule,
        TooltipModule,
        LinkUserComponent,
        SkeletonModule
    ],
	declarations: [DeviceListComponent]
})
export class DeviceListModule { }
