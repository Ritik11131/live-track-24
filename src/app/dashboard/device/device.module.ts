import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceRoutingModule } from './device-routing.module';
import { LinkUserComponent } from './listDevice/presenter/list/linkDevice/presenter/link-user/link-user.component';
import { UnLinkUserComponent } from './un-link-user/un-link-user.component';
import { ViewUserComponent } from './view-user/view-user.component';
@NgModule({
    imports: [
        CommonModule,
        DeviceRoutingModule,
        LinkUserComponent,
        UnLinkUserComponent,
        ViewUserComponent
    ],
    declarations: []
})
export class DeviceModule { }
