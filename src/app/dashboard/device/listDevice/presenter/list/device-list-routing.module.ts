import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DeviceListComponent } from './device-list.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: DeviceListComponent }
	])],
	exports: [RouterModule]
})
export class DeviceListRoutingModule { }
