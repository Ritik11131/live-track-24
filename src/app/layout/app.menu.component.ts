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
        this.model.push({label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/']})
        this.model.push({label: 'Tracking', icon: 'pi pi-car', routerLink: ['/tracking']})
        this.model.push({label: 'Devices', icon: 'pi pi-server', routerLink: ['/device',"null"]})
        this.model.push({label: 'Users', icon: 'pi pi-user', routerLink: ['/user']})
        if (this.authService.userType === "Admin") {
            this.model.push({label: 'Raw Data', icon: 'pi pi-book', routerLink: ['/raw']})
            if (config.subscriptionPlan) {
                this.model.push({label: 'Plan Billing', icon: 'pi pi-money-bill', routerLink: ['/planBillings']})
            }
        }

        this.model.push({label: 'Reports', icon: 'pi pi-chart-bar', routerLink: ['/reports']})
        this.model.push({label: 'Notifications', icon: 'pi pi-inbox', routerLink: ['/notifications'],})
        // this.model.push({label: 's', icon: 'pi pi-inbox', routerLink: ['/settings'],})

        // this.model.push({label: 'Inventory', icon: 'pi pi-users', routerLink: ['/inventory'],})
        this.model.push({label: 'Geofence', icon: 'pi pi-map-marker', routerLink: ['/geofence'],})
        // this.model.push({label: 'Tracking1', icon: 'pi pi-car', routerLink: ['/tracking1']})

        if(config.layout==1){
            this.model.push({label: 'BMS', icon: 'pi pi-database', routerLink: ['/bms'],})
        }
    }

    closeSidebar() {
        this.layoutService.closeSidebarFunction(false);
    }
}
 