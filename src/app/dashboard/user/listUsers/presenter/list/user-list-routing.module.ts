import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserListComponent } from './user-list.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: UserListComponent }
	])],
	exports: [RouterModule]
})
export class UserListRoutingModule { }
