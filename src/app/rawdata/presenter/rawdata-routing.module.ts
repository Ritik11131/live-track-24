import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {RawdataComponent} from "./rawdata.component";

@NgModule({
  imports: [RouterModule.forChild([
    { path: '', component:RawdataComponent},
  ])],
  exports: [RouterModule]
})
export class RawdataRoutingModule { }

