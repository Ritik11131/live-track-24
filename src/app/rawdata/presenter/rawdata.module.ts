import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RawdataRoutingModule } from './rawdata-routing.module';
import {RawdataComponent} from "./rawdata.component";
import {DeviceStatusPipe} from "../device-status.pipe";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RawdataRoutingModule,
    RawdataComponent
  ],
  providers:[DeviceStatusPipe,DialogService,DynamicDialogRef]
})
export class RawdataModule { }
