import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
// import { CreateUpdateComponent } from './createUpdateUser/presenter/create-update/create-update.component';
import { UserDeviceListComponent } from './user-device-list/user-device-list.component';
import { Breadcrumb } from 'primeng/breadcrumb';
import { ConfigurationDetailComponent } from './configurationDetails/presenter/configuration-detail/configuration-detail.component';
@NgModule({
    imports: [RouterModule.forChild([
        { path: '', data: {breadcrumb: 'List'}, loadChildren: () => import('./listUsers/presenter/list/user-list.module').then(m => m.UserListModule) },
   
        { path: 'create', data: {breadcrumb: 'Create User'}, loadChildren: () => import('./createUser/presenter/create/user-create.module').then(m => m.UserCreateModule) },

        { path: 'update', data: {breadcrumb: 'Update User'}, loadChildren: () => import('./createUser/presenter/create/user-create.module').then(m => m.UserCreateModule) },
        { path: ':param', data: { breadcrumb: 'User Management' }, loadChildren: () => import('./listUsers/presenter/list/user-list.module').then(m => m.UserListModule) },
        {
            path: "", // parent route path
    
            children: [
              { path: "view-devices", data: {breadcrumb: 'User Device List'}, component: UserDeviceListComponent }, // child route for viewing users
              
              // Add more child routes as needed
            ],
          },
    ])],
    exports: [RouterModule]
})
export class UserRoutingModule { }
