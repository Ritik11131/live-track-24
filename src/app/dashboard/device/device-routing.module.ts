import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', data: {breadcrumb: 'List'}, loadChildren: () => import('./listDevice/presenter/list/device-list.module').then(m => m.DeviceListModule) },
        { path: 'create', data: {breadcrumb: 'Create Device'}, loadChildren: () => import('./createDevice/presenter/create/device-create.module').then(m => m.DeviceCreateModule) },
        { path: 'update', data: {breadcrumb: 'Update Device'}, loadChildren: () => import('./createDevice/presenter/create/device-create.module').then(m => m.DeviceCreateModule) },
        { path: ':param', data: { breadcrumb: 'Device Details' }, loadChildren: () => import('./listDevice/presenter/list/device-list.module').then(m => m.DeviceListModule) },

        // { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class DeviceRoutingModule { }
