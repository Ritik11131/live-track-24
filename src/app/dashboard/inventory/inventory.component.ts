import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from "primeng/tabmenu";
import { CommonModule } from '@angular/common';
import { MenuItem } from "primeng/api";
import { InventoryService } from "src/app/service/inventory.service";

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [TableModule,CommonModule,TabMenuModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent  {
  items: MenuItem[] | undefined;
message:number=1;

constructor(    private inventoryService: InventoryService
  ){
    this.inventoryService.currentMessage.subscribe(message => this.message = message);

  this.items = [
    { label: "User List", icon: "pi pi-user", routerLink: "user-list" },
    { label: "Device List", icon: "pi pi-car", routerLink: "device-list" },

  ];
}

}
