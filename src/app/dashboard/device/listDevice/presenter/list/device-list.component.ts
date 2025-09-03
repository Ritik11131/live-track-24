import {
  AfterViewInit,
  Component,
  OnInit,
  ViewContainerRef,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Table } from "primeng/table";
import { config } from "src/config";

import { DeviceRechargeService } from "../../../rechargeModule/domain/device-recharge.service";
import { UserService } from "../../../../user/services/user.service";
import { ConfirmationService, MessageService } from "primeng/api";
import * as XLSX from "xlsx";
import { User } from "../../../../user/models/user.model";
import { DeviceService } from "../../../../../service/device.service";
import { Device } from "../../../../../models/device";
import { linkedUser } from "src/app/demo/api/linkedUser";
import { VehicleListService } from "../../../../../service/vehicle-list.service";
import { Subscription } from "rxjs";
import { LayoutService } from "src/app/layout/service/app.layout.service";
import { AuthService } from "src/app/service/auth.service";
import { ConfirmationDialogService } from "src/app/dashboard/commonComponents/confirmationDialog/domain/confirmation-dialog.service";
import { LinkMultipleDeviceService } from "../../../linkMultipleDevice/domain/link-multiple-device.service";
import { listDeviceRepository } from "../../domain/listDevice.repository";
import { ToastService } from "../../../../../service/toast.service";
import { DeviceTypeService } from "../../../deviceTypeData/domain/device-type-list.service";
import { SendCommandService } from "../../../sendCommand/domain/sendCommand.service";
import { FileUploadService } from "../../../fileUpload/domain/file-upload.service";
import {jwtDecode} from "jwt-decode";
@Component({
  templateUrl: "./device-list.component.html",
  styleUrls: ["./device-list.component.scss"],
  providers: [ConfirmationService, listDeviceRepository],
})
export class DeviceListComponent implements OnInit, AfterViewInit {
  selectedDevices: any[] = [];
  selectUserID: number = 0;
  users: User[] = [];
  customers: { id: number; userName: string }[] = [];

  devices: Device[] = [];
  filteredDevices: Device[] = [];
  linkUserForm: boolean = false;
  updateUserForm: boolean = false;
  currentUserId = 0

  expandedRowId: any = null;
  linkedUsers: { [deviceId: string]: linkedUser[] } = {};
  userData: boolean = false;
  deviceData: boolean = false;
  subscription!: Subscription;
  deviceId!: number;
  isCustomer: boolean = false;
  isListVisible = false;
  visibleDropdown: number | null = null; // Tracks which dropdown is visible
  showExpireDevices = false
  toggleList(index: number) {
    this.visibleDropdown = this.visibleDropdown === index ? null : index;
  }

  setNextValidity(device: Device) {
    this.deviceRechargeService
    .open(this.viewContainerRef,device.id,device.validity.nextRechargeDate )
    .subscribe((result) => {
      if (result == "yes") {
        this.toastService.showSuccessToast("Validity Updated Successfully");
      } else {
        this.toastService.errorToast(result);
      }
    });
  }
  constructor(
    private userService: UserService,
    private router: Router,
    public deviceService: DeviceService,
    private vehicleListService: VehicleListService,
    public layoutService: LayoutService,
    public listDeviceRepo: listDeviceRepository,
    private confirmationDialogService: ConfirmationDialogService,
    private viewContainerRef: ViewContainerRef,
    private linkMultipleDeviceService: LinkMultipleDeviceService,
    private toastService: ToastService,
    private deviceRechargeService: DeviceRechargeService,

    private authService: AuthService,
    private sendCommandService: SendCommandService,
    private deviceTypeService: DeviceTypeService,
    private fileUploadService: FileUploadService
  ) {
    this.subscription = this.deviceService.addUserbuttonClick$.subscribe(() => {
      this.loadLinkedUsers(this.deviceId.toString());
      this.toastService.toastMessage(
        "success",
        "Success",
        "User have been linked successfully"
      );
    });
    this.deviceService.customerDeviceUpdated$.subscribe(() => {
      this.getDeviceList();
    });
    const authToken = this.authService.currentToken;
    const decoded:any=jwtDecode(authToken);
    this.currentUserId = decoded.user_id;
  }

  ngOnInit() {
    this.getUserList();

    this.getDeviceList();
    if (this.authService.userType === "Customer") {
      this.isCustomer = true;
    }
  }

  ngAfterViewInit(): void {
    const urlParts = this.router.url.split("/");
    const fragment = urlParts[urlParts.length - 1];
    if (fragment) {
      if (fragment === "Device%20updated%20successfully") {
        this.toastService.showSuccessToast("Device updated successfully");
      } else if (fragment === "Device%20created%20successfully") {
        this.toastService.showSuccessToast("Device created successfully");
      }
    }
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getUserList(): void {
    this.userService.getUsers().subscribe(
      (d) => {
        this.users = d;
        const dt = { userName: "All", id: 0 };
        this.customers = d.map((user) => ({
          userName: user.userName,
          id: user.id,
        }));
        this.customers = [dt, ...this.customers];
      },
      this.toastService.errorToast,
      () => {}
    );
  }

  getDevicesByUserId(id: number) {
    this.selectUserID = id;
    if (id == 0) {
      this.getDeviceList();
      return;
    }
    this.listDeviceRepo.getUserDeviceData(id).subscribe(
      (d) => {
        this.devices = d;
        this.updateFilteredList()
      },
      (e) => {
        this.toastService.errorToast(e);
        this.devices = [];
        this.updateFilteredList()
      },
      () => {}
    );
  }

  updateFilteredList(): void {
    if(!this.showExpireDevices) {
      this.filteredDevices = this.devices
      return
    }
    this.filteredDevices = this.devices.filter((device) => {
      const customerRechargeDate = new Date(device.validity.customerRechargeDate);
      return customerRechargeDate < new Date();
    })
    console.log(this.filteredDevices)
  }

  deleteDevices(): void {
    if (this.selectedDevices.length === 0) {
      return;
    }
    const deviceIds = this.selectedDevices.map((x) => x.id);
    this.deleteEntries(deviceIds).then((allDeleted) => {
      if (allDeleted) {
        this.getDeviceList();
        this.toastService.showSuccessToast(
          "All devices have been successfully deleted."
        );
      } else {
        this.toastService.showErrorToast(
          "Some devices could not be deleted."
        );
      }
    });
  }
  
  async deleteEntries(ids: number[]): Promise<boolean> {
    try {
      const deletePromises = ids.map((id) =>
        this.listDeviceRepo.deleteDeviceData(id).toPromise()
      );
      const results = await Promise.allSettled(deletePromises);
  
      const allDeleted = results.every(result => result.status === 'fulfilled');
  
      return allDeleted;
    } catch (error) {
      this.toastService.showErrorToast(
        "An error occurred during the deletion process."
      );
      return false;
    }
  }
  
  openFileUploadComponent() {
    this.fileUploadService
      .open(this.viewContainerRef, this.selectUserID)
      .subscribe((result) => {
        if (result == "done") {
          this.toastService.showSuccessToast("Devices Added Successfully");
          this.getDeviceList();
        } else {
          this.toastService.errorToast(result);
          this.getDeviceList();
        }
      });
  }
 

  linkMultipleDevices() {
    this.linkMultipleDeviceService
      .open(this.viewContainerRef,"Link Multiple Devices", this.selectedDevices)
      .subscribe((result) => {
        if (result == "yes") {
          this.toastService.showSuccessToast(
            "Users have been linked successfully"
          );
        } else {
          console.log("Dialog was cancelled");
        }
      });
  }

  linkPlanWithDevices(){
    this.linkMultipleDeviceService
    .open(this.viewContainerRef,"Link Plan", this.selectedDevices)
    .subscribe((result) => {
      if (result == "yes") {
        this.toastService.showSuccessToast(
          "Plan have been linked successfully"
        );
      } else {
        this.toastService.errorToast(result);
      }
    });
  }
  sendCommand() {
    this.sendCommandService
      .open(this.viewContainerRef, this.selectedDevices)
      .subscribe((result) => {
        if (result == "yes") {
          this.toastService.showSuccessToast("Command Sent successfully");
        } else {
          console.log("Dialog was cancelled");
        }
      });
  }
  openDialog() {
    this.confirmationDialogService
      .open(this.viewContainerRef, "DELETE")
      .subscribe((result) => {
        if (result == "yes") {
          // debugger;
          this.deleteDevices();
        } else {
          console.log("Dialog was cancelled");
        }
      });
  }

  getDeviceList(): void {
    this.deviceData = true;
    this.devices = [];
    this.updateFilteredList()
    this.selectedDevices = [];
    this.listDeviceRepo.getDeviceData().subscribe(
      (d) => {
        this.devices = d;
        this.updateFilteredList()
      },
      this.toastService.errorToast,
      () => {
        this.deviceData = false;
      }
    );
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, "contains");
  }

  onDropDownGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, "contains");
  }

  navigateToCreateDevice() {
    if (this.selectUserID != 0) {
      this.router.navigate(["/device/create"], {
        queryParams: { userId: this.selectUserID },
      });
    } else {
      this.router.navigate(["/device/create"]);
    }
  }
  toggleDevices() {
    this.showExpireDevices = !this.showExpireDevices;
    this.updateFilteredList()
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

  changedevice(deviceId: any): void {
    this.deviceId = deviceId;
    this.updateUserForm = true;
    this.deviceService.passDeviceId(deviceId);
  }

  unLinkUser(
    device: Device,
    mappingId: number,
    deviceId: number,
    userId: number
  ) {
    this.confirmationDialogService
      .open(this.viewContainerRef, "UNLINK")
      .subscribe((result) => {
        if (result == "yes") {
          this.listDeviceRepo
            .unLinkUserData(mappingId, deviceId, userId)
            .subscribe(
              () => {
                setTimeout(() => {
                  // Reload the current route to reflect the changes
                  this.router.routeReuseStrategy.shouldReuseRoute = () => false;
                  const currentUrl = this.router.url;
                  this.loadLinkedUsers(device.id.toString());
                }, 500);
                this.toastService.showSuccessToast(
                  "Device Unlinked Successfully"
                );
              },
              this.toastService.errorToast,
              () => {}
            );
        } else {
          console.log("Dialog was cancelled");
        }
      });
  }

  toggleRow(device: Device): void {
    this.loadLinkedUsers(device.id.toString());
  }

  loadLinkedUsers(deviceId: string) {
    this.userData = true;
    this.listDeviceRepo.getUserListByDeviceIdData(deviceId).subscribe(
      (data) => {
        this.linkedUsers[deviceId] = data;
        console.log(this.linkedUsers[deviceId])
      },
      (error) => {
        // this.messageService.add({
        //     severity: "error",
        //     summary: "Error",
        //     detail: error.error?.data ?? "Some thing went wrong",
        // });
      },
      () => {
        this.userData = false;
      }
    );
    this.linkUserForm = false;
  }

  closePopupForm(isClosed: boolean) {
    this.linkUserForm = isClosed;
  }

  closeUpdatePopupForm(isClosed: boolean) {
    this.updateUserForm = isClosed;
  }
  showDeviceType() {
    this.deviceTypeService.open(this.viewContainerRef).subscribe((result) => {
      console.log(result);
    });
  }
  protected readonly config = config;

  exportCSV() {

  }

  exportDevices() {
    const headers = [
      { header: "VehicleNo", field: "vehicleNo" },
      { header: "Unique Id", field: "deviceId" },
      { header: "Device Imei", field: "deviceImei" },
      { header: "P.Phone No", field: "simPhoneNumber" },
      { header: "S.Phone No", field: "simSecPhoneNumber" },
      { header: "Next Customer Recharge", field: "validity.customerRechargeDate" },
      { header: "Device Type", field: "fkDeviceType" }// Added new header
    ];

    // Prepare the data to be exported
    const wsData = [
      headers.map(h => h.header), // Add header row
      ...this.filteredDevices.map((device: any) =>
          headers.map(h => {
            // Handle nested fields using path notation (e.g., 'validity.nextRechargeDate')
            if(h.field == "fkDeviceType") {
              return this.deviceService.getDeviceTypeLabel(device.fkDeviceType)
            }
            return h.field.includes('.')
                ? h.field.split('.').reduce((obj, key) => obj?.[key], device)
                : device[h.field];
          })
      )
    ];

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(wsData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `device-${new Date().getTime()}.xlsx`);
  }
}
