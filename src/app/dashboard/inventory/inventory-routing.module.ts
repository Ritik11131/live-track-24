import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import { InventoryComponent } from './inventory.component';
import { UserListComponent } from './user-list/user-list.component';
import { DeviceListComponent } from './device-list/device-list.component';
@NgModule({
    imports: [RouterModule.forChild([
        {
            path: '', component: InventoryComponent, children: [
                {path: '', redirectTo: 'user-list', pathMatch: "full"},
                {path: 'user-list', component: UserListComponent},
                {path: 'device-list', component: DeviceListComponent},

            ]
        },
    ])],
    exports: [RouterModule]
})
export class InventoryRoutingModule {
}

