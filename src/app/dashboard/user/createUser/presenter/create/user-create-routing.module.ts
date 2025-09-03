import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { userCreateComponent } from './user-create.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: userCreateComponent }
	])],
	exports: [RouterModule]
})
export class UserCreateRoutingModule { }
