import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonModule} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {InputNumberModule} from 'primeng/inputnumber';
import {ChartModule} from 'primeng/chart';
import {RippleModule} from 'primeng/ripple';
import {TooltipModule} from 'primeng/tooltip';
import {SaaSDashboardComponent} from './saas.dashboard.component';
import {SaaSDashboardRoutingModule} from './saas.dashboard-routing.module';
import {FormsModule} from '@angular/forms';
import {AvatarGroupModule} from 'primeng/avatargroup';
import {AvatarModule} from 'primeng/avatar';
import {ProgressBarModule} from 'primeng/progressbar';
import {PanelModule} from 'primeng/panel';

import {TabViewModule} from 'primeng/tabview';
import {TagModule} from 'primeng/tag';
import {InputTextModule} from "primeng/inputtext";
import { MultiSelectModule } from "primeng/multiselect";
import { DatePipe } from '@angular/common';

import {LeafletMarkerClusterModule} from "@asymmetrik/ngx-leaflet-markercluster";
@NgModule({
    imports: [
        CommonModule,
        ButtonModule,
        DatePipe,
        RippleModule,
        MultiSelectModule,
        TagModule,
        TooltipModule,
        TableModule,
        InputNumberModule,
        ChartModule,
        FormsModule,
        AvatarGroupModule,
        AvatarModule,
        ProgressBarModule,
        PanelModule,
        TabViewModule,
        TagModule,
        SaaSDashboardRoutingModule,
        InputTextModule,
        LeafletMarkerClusterModule,
    ],
    declarations: [SaaSDashboardComponent]
})
export class SaaSDashboardModule {
}
