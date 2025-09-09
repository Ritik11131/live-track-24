import {Component, OnInit} from '@angular/core';
import {MenuItem} from 'primeng/api';
import {LayoutService} from './service/app.layout.service';
import { config } from 'src/config';
import { AuthService } from '../service/auth.service';
@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];
    constructor(public layoutService: LayoutService,private authService:AuthService) {
    }


    ngOnInit() {
        this.loadAppMenu()
    }

    loadAppMenu(){
        this.model = []
        this.model.push({label: 'Dashboard', icon: 'lni lni-dashboard-square-1', routerLink: ['/']})
        this.model.push({label: 'Tracking', icon: 'lni lni-route-1', routerLink: ['/tracking']})
        this.model.push({label: 'Devices', icon: 'lni lni-cloud-iot-2', routerLink: ['/device',"null"]})
        this.model.push({label: 'Users', icon: 'lni lni-user-multiple-4', routerLink: ['/user']})
        if (this.authService.userType === "Admin") {
            this.model.push({label: 'Raw Data', icon: 'lni lni-database-2', routerLink: ['/raw']})
            if (config.subscriptionPlan) {
                this.model.push({label: 'Plan Billing', icon: 'pi pi-money-bill', routerLink: ['/planBillings']})
            }
        }

        this.model.push({label: 'Reports', icon: 'lni lni-folder-1', routerLink: ['/reports']})
        this.model.push({label: 'Notifications', icon: 'lni lni-bell-1', routerLink: ['/notifications'],})
        // this.model.push({label: 's', icon: 'pi pi-inbox', routerLink: ['/settings'],})
        // this.model.push({label: 'Inventory', icon: 'pi pi-users', routerLink: ['/inventory'],})
        this.model.push({label: 'Geofence', icon: 'lni lni-map-marker-1', routerLink: ['/geofence'],})
        // this.model.push({label: 'Tracking1', icon: 'pi pi-car', routerLink: ['/tracking1']})

        if(config.layout==1){
            this.model.push({label: 'BMS', icon: 'pi pi-database', routerLink: ['/bms'],})
        }
    }

    closeSidebar() {
        this.layoutService.closeSidebarFunction(false);
    }
}
 