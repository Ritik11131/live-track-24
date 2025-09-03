import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NotfoundComponent } from '../demo/components/notfound/notfound.component';
import { Path } from 'leaflet';
@NgModule({
    imports: [RouterModule.forChild([
 
         { path: '', data: {breadcrumb: 'Dashboard'}, loadChildren: () => import('./dashboard/presenter/main/saas.dashboard.module').then(m => m.SaaSDashboardModule) },
    ])],
    exports: [RouterModule]
})
export class DashboardsRoutingModule { }
