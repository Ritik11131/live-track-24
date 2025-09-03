import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AppLayoutComponent } from './layout/app.layout.component';
import {AppauthGuard} from "./guard/auth.guard";
import { GeofenceComponent } from './dashboard/geofence_module/geofence/presenter/geofence/geofence.component';
import { ReportsComponent } from './dashboard/report/presenter/reports/reports.component';
import { NotificationComponent } from './dashboard/notifications/presenter/notification/notification.component';
import { ShareTrackingLinkComponent } from './shareTrackingLink/presenter/share-tracking-link/share-tracking-link.component';
import { BmsComponent } from './dashboard/bmsModule/presenter/bms/bms.component';
import { BillingPlansComponent } from './dashboard/billingPlanModule/billingPlans/presenter/billing-plans/billing-plans.component';
import { TrackingHomeComponent } from './dashboard/vehicleTracking/trackingHome/tracking-home/tracking-home.component';
const routes: Routes = [
    {
        path: '', component: AppLayoutComponent,
        canActivate: [AppauthGuard],
        children: [

            { path: '', loadChildren: () => import('./dashboard/dashboards-routing.module').then(m => m.DashboardsRoutingModule) },
            { path: 'user', data: { breadcrumb: 'User Management' }, loadChildren: () => import('./dashboard/user/user-routing.module').then(m => m.UserRoutingModule) },
            { path: 'device', data: { breadcrumb: 'Device Management' }, loadChildren: () => import('./dashboard/device/device-routing.module').then(m => m.DeviceRoutingModule) },
            { path: 'raw', data: { breadcrumb: 'Raw Data' }, loadChildren: () => import('./rawdata/presenter/rawdata.module').then(m => m.RawdataModule) },
            { path: 'tracking', data: { breadcrumb: 'Vehicle List' }, loadChildren: () => import('./tracking/vehicleList/presenter/vehicle-list/vehicle-list-routing.module').then(m => m.VehicleListRoutingModule) },
            {path:'reports',data:{breadcrumb: 'Reports'},component:ReportsComponent},        
                {path:'planBillings',data:{breadcrumb: 'Plan billing'},component:BillingPlansComponent},

            // {path:'tracking1',data:{breadcrumb: 'Tracking1'},component:TrackingHomeComponent},

            {path:'notifications',data:{breadcrumb: 'Notifications'},component:NotificationComponent},
            // {path:'settings',data:{breadcrumb: 'Settings'},component:ConfigurationSettingComponent},
            // {path:'inventory',data:{breadcrumb: 'Inventory'},loadChildren:()=>import("./dashboard/inventory/inventory-routing.module").then(m=>m.InventoryRoutingModule)},
            {path:'geofence',data:{breadcrumb: 'Geofence'},component:GeofenceComponent},
            {path:'bms',data:{breadcrumb: 'BMS'},component:BmsComponent},



        ]
    },
    {path:'loc/:vehicleNo',component:ShareTrackingLinkComponent},
    {path:'track/:id',component:ShareTrackingLinkComponent},
    { path: 'auth', data: { breadcrumb: 'Auth' }, loadChildren: () => import('./auth/auth-routing.module').then(m => m.AuthRoutingModule) },
    { path: 'notfound', loadChildren: () => import('./demo/components/notfound/notfound.module').then(m => m.NotfoundModule) },
    { path: '**', redirectTo: '/notfound' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
