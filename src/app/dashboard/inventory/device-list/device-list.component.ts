import { Component, OnInit,ViewContainerRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Table } from "primeng/table";
import { UserService } from "../../user/services/user.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { User } from "../../user/models/user.model";
import { DeviceService } from "../../../service/device.service";
import { Device } from "../../../models/device";
import { linkedUser } from "src/app/demo/api/linkedUser";
import { VehicleListService } from "../../../service/vehicle-list.service";
import { Subscription } from "rxjs";
import { CommonModule } from "@angular/common";
import { RippleModule } from "primeng/ripple";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { ProgressBarModule } from "primeng/progressbar";
import { ToastModule } from "primeng/toast";
import { ConfirmationDialogService } from "src/app/dashboard/commonComponents/confirmationDialog/domain/confirmation-dialog.service";

import { DropdownModule } from "primeng/dropdown";
import { FormsModule } from "@angular/forms";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { TooltipModule } from "primeng/tooltip";
import { SkeletonModule } from "primeng/skeleton";
import { FileUploadComponent } from "../../device/fileUpload/presenter/file-upload/file-upload.component";

import { LinkUserComponent } from "../../device/listDevice/presenter/list/linkDevice/presenter/link-user/link-user.component";
import { CommonUtils } from "src/app/utils/commonUtils";
import { ToastService } from "src/app/service/toast.service";
@Component({
  selector: "app-device-list",
  standalone: true,
  imports: [
    CommonModule,
    RippleModule,
    ButtonModule,
    InputTextModule,
    FileUploadComponent,
    TableModule,
    ProgressBarModule,
    ToastModule,
    DropdownModule,
    FormsModule,
    ConfirmDialogModule,
    TooltipModule,
    LinkUserComponent,
    SkeletonModule,
  ],
  templateUrl: "./device-list.component.html",
  styleUrls: ["./device-list.component.scss"],
  providers: [ ConfirmationService],
})
export class DeviceListComponent implements OnInit {
  selectedDevices: any[] = [];
  selectedUser!: User;
  users!: User[];
  devices: Device[] = [];
  linkUserForm: boolean = false;
  expandedRowId: any = null;
  linkedUsers: { [deviceId: string]: linkedUser[] } = {};
  userData: boolean = false;
  deviceData: boolean = false;
  fileComponent: boolean = false;
  subscription!: Subscription;
  deviceId!: number;
  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private router: Router,
    public route: ActivatedRoute,
    private confirmationDialogService:ConfirmationDialogService,
    private viewContainerRef: ViewContainerRef,
    public deviceService: DeviceService,
    private vehicleListService: VehicleListService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.subscription = this.vehicleListService.closeFileForm$.subscribe(
      (isOpen) => {
        this.fileComponent = isOpen;
      }
    );
    this.route.queryParams.subscribe((params) => {
      if (!params["userId"]) return;
      const id = Number(params["userId"]);
      this.getDeviceList(id);

      }); 
  }

  deleteDevices(): void {
    if (this.selectedDevices.length === 0) {
      return;
    }
    const deviceIds = this.selectedDevices.map((x) => x.id);
    this.deleteEntries(deviceIds).then((r) => {
      setTimeout(() => {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        const currentUrl = this.router.url;
        this.router
          .navigateByUrl("/", { skipLocationChange: true })
          .then(() => {
            this.router.navigate([currentUrl]);
          });
      }, 500);
    });
  }
  openFileUploadComponent() {
    this.fileComponent = true;
  }
  async deleteEntries(ids: number[]) {
    try {
      const deletePromises = ids.map((id) =>
        this.deviceService.deleteDevices(id).toPromise()
      );
      await Promise.all(deletePromises);
      this.toastService.toastMessage("success","Device List","All entries have been successfully deleted.")
  
    } catch (error) {
      console.error("Error:", error);
    }
  }
  openDialog(){
    this.confirmationDialogService.open(this.viewContainerRef, 'DELETE')
    .subscribe(result => {
      if (result=='yes') {
     this.deleteDevices();
} else {
        console.log('Dialog was cancelled');
      }
    })
  }
  // confirm(event: any) {

  //   this.confirmationService.confirm({
  //     target: event.target,
  //     message: "Are you sure that you want to proceed?",
  //     icon: "pi pi-exclamation-triangle",
  //     accept: () => {
  //       this.deleteDevices();
  //     },
  //     reject: () => {
  //       //reject action
  //     },
  //   });
  // }

  getDeviceList(id :number): void {
    this.deviceData = true;
    this.devices = [];
    this.selectedDevices = [];
    this.deviceService.getDeviceList(id).subscribe(
      (d) => {
        this.devices = d;
      },
      (e) => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: e.error?.data.message ?? "Some thing went wrong",
        });
      },
      () => {
        this.deviceData = false;
      }
    );
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, "contains");
  }

  navigateToCreateDevice() {
    this.router.navigate(
      ["/device/create"]
    );
  }

  navigateToUpdateDevice(deviceId: any) {
    this.router.navigate(["/device/update"], {
      queryParams: { deviceId: deviceId },
    });
  }

  linkUser(uniqueId: number, deviceId: number) {
    this.deviceId = deviceId;
    this.linkUserForm = true;
    this.deviceService.passData(uniqueId, deviceId);
  }

  closePopupForm(isClosed: boolean) {
    this.linkUserForm = isClosed;
  }
}
