import { Component, OnInit } from "@angular/core";
import { Table, TableModule } from "primeng/table";
import { CommonModule } from "@angular/common";
import { ToastModule } from "primeng/toast";
import { RippleModule } from "primeng/ripple";
import { MessageService } from "primeng/api";
import { InputTextModule } from "primeng/inputtext";
import { DropdownModule } from "primeng/dropdown";
import { ButtonModule } from "primeng/button";
import { DeviceService } from "src/app/service/device.service";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { Notification } from "src/app/dashboard/notifications/domain/notification.model";
import { DatePipe } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { SkeletonModule } from "primeng/skeleton";
import { GeocodingService } from "src/app/service/geocoding.service";
import { CommonUtils } from "src/app/utils/commonUtils";
import { PaginatorModule } from "primeng/paginator";
import { notificationRepository } from "../../domain/notification.repository";
import { NotificationService } from "src/app/dashboard/notifications/domain/notification.service";
import { Device } from "src/app/models/device";
import { ToastService } from "src/app/service/toast.service";
@Component({
  selector: "app-notification",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    SkeletonModule,
    TableModule,
    FormsModule,
    InputTextModule,
    DropdownModule,
    PaginatorModule,
    ButtonModule,
    CommonModule,
    ToastModule,
    RippleModule,
  ],
  templateUrl: "./notification.component.html",
  styleUrls: ["./notification.component.scss"],
  providers: [DatePipe, notificationRepository],
})
export class NotificationComponent implements OnInit{
  devices: Device[] = [];
  selectedVehicle: number | null = null;
  notificationLoading: boolean = false;
  notifications: Notification[] = [];
  fullDisplay: boolean = false;
  isFirstDivVisible = true;
  selectedNotificationType: string[] | null = null;
  LastTime: string | null = null;
  Limit: number = 30;
  reports: any[] = [
    { name: "Select a Notification Type", code: null }, // Placeholder option

    { name: "Geofence Enter", code: "geofenceEnter" },
    { name: "Geofence Exit", code: "geofenceExit" },
    { name: "Ignition On", code: "ignitionOn" },
    { name: "Ignition Off", code: "ignitionOff" },
    { name: "Power Cut", code: "powerCut" },
    { name: "Power Restored", code: "powerRestored" },
    { name: "Over Speed", code: "overspeed" },
    { name: "Parking", code: "parking" },
  ];
  currentPage: number = 1; // Initially, the current page is 1

  constructor(
      public deviceService: DeviceService,
      private notificationRepo: notificationRepository,
      private toastService: ToastService
  ) {}
  ngOnInit(): void {
    this.getDeviceList();
    this.getNotification();
  }
  paginate(event: any) {
    let pageIndex = event.first / event.rows + 1;
    if (pageIndex % 3 == 0) {
      this.LastTime =
          this.notifications[this.notifications.length - 1].eventtime;
      this.getNotification(true);
    }
  }
  getNotification(append: boolean = false) {
    this.notificationRepo
        .notificationData(
            this.Limit,
            this.LastTime,
            this.selectedNotificationType,
            this.selectedVehicle
        )
        .subscribe(
            (notifications) => {
              if (append) {
                // Append incoming notifications to the existing list
                this.notifications = this.notifications.concat(notifications);
              } else {
                // Replace notifications if append is false or if the list is empty
                this.notifications = notifications;
              }
            },
            (e) => {
              if (!append) {
                this.notifications = [];
              }
              this.toastService.toastMessage("error","Message", e.error.data);
            }
        );
  }
  getDeviceList(): void {
    this.notificationLoading = true;

    this.notificationRepo.deviceData().subscribe(
        (d) => {
          this.devices = d;
        },
        (e) => {
          this.toastService.toastMessage("error","Message", e.error.data);
        },
        () => {
          this.notificationLoading = false;
        }
    );
  }
  onDropdownChange(event: any) {
    if (event.value === null) {
      this.selectedNotificationType = null;
    } else {
      this.selectedNotificationType = [];
      this.selectedNotificationType.push(event.value);
    }
  }
  onDropDownGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, "contains");
  }
  onDropdownChange1(event: any) {
    this.selectedVehicle = event.value;
  }

  toggleArrow() {
    this.fullDisplay = !this.fullDisplay;
    this.isFirstDivVisible = !this.isFirstDivVisible;
  }
}
