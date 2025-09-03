import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { deviceCreateComponent } from './device-create.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: deviceCreateComponent }
	])],
	exports: [RouterModule]
})
export class DeviceCreateRoutingModule { }
