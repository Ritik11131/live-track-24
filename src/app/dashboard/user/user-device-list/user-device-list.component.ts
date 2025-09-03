import { Component, OnInit } from "@angular/core";
import { DeviceService } from "src/app/service/device.service";
import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { Table } from "primeng/table";
import { ActivatedRoute, Router } from "@angular/router";
import { Device } from "src/app/models/device";
import { MessageService} from "primeng/api";
@Component({
  selector: "app-user-device-list",
  standalone: true,
  imports: [InputTextModule, CommonModule, ButtonModule, TableModule],
  templateUrl: "./user-device-list.component.html",
  styleUrls: ["./user-device-list.component.scss"],
  providers:[MessageService]
})
export class UserDeviceListComponent {
  devices: Device[] = [];
  userName:string = '';
  deviceId: number = 0;
  private sub: any;
  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public deviceService: DeviceService,
    private messageService:MessageService,
  ) {}
  ngOnInit() {
    this.sub = this.route.queryParams.subscribe((v) => {
      this.deviceId = v["userId"] || 0;
      this.userName=v['userName'] || '';
    });
    this.deviceService.getDeviceList(this.deviceId).subscribe((res) => {
      this.devices=res
    },
    (error) => {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: error.error?.data.message?? "Something went wrong",
      });
    },
    () => {})
  }
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
}
navigateToUpdateDevice(deviceId: any) {
  this.router.navigate(["/device/update"], {
    queryParams: { deviceId: deviceId },
  });
}
}
