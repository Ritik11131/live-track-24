import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import {PushDataService} from "../../../service/push-data.service";
import {Subscription} from "rxjs";
import {HelperMap, MapData} from "../../../../helper-map";
import {VehicleListService} from "../../../../service/vehicle-list.service";
import {ButtonModule} from "primeng/button";
import {DatePipe} from "@angular/common";
import {TooltipModule} from "primeng/tooltip";
import {SkeletonModule} from "primeng/skeleton";
import {CommonModule} from "@angular/common";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import * as L from "leaflet";
import {ButtonDialogService} from "src/app/dashboard/commonComponents/buttonDialog/domain/buttonDailog.service";
import { ConfirmationService} from "primeng/api";
import {ToastModule} from "primeng/toast";
import {config} from "src/config";
import {DialogComponent} from "../../../overspeed/presenter/dialog/dialog.component";
import {
  DatePickerComponent
} from "../../../../dashboard/commonComponents/dateComponent/presenter/date-picker/date-picker.component";
import {CommonUtils} from "src/app/utils/commonUtils";
import {DevicetrackingService} from "src/app/tracking/trackingLink/domain/devicetracking.service";
import {vehicleDetailRepository} from "../../domain/vehicleDetail.repository";
import {ToastService} from "src/app/service/toast.service";

@Component({
  selector: "app-vehicle-details",
  standalone: true,
  imports: [
    DatePickerComponent,
    DialogComponent,
    DatePipe,
    ButtonModule,
    ToastModule,
    TooltipModule,
    SkeletonModule,
    ConfirmDialogModule,
    CommonModule,
  ],
  templateUrl: "./vehicle-details.component.html",
  styleUrl: "./vehicle-details.component.scss",
  providers: [ConfirmationService, vehicleDetailRepository],
})
export class VehicleDetailsComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  subscription1!: Subscription;
  subscription2!: Subscription;
  data!: MapData;
  map!: HelperMap<MapData>;
  interval!: any;
  address: String = "Loading address";
  detailData: boolean = false;
  dateComponent: boolean = false;
  dialogComponent: Boolean = false;
  coordinates: any;
  previousLatLng!: L.LatLng | undefined;
  deviceId!: number;
  isDragging: boolean = false;
  selectedCommands!: any;
  selectedOptions!: any;
  subscription3!: Subscription;
  private marker!: L.Marker;
  private polyline!: L.Polyline;
  private pathCoordinates: L.LatLng[] = [];
  @HostListener('window:resize', [])
onResize() {
  this.checkScroll();
}
checkScroll() {
  const tabsBoxElement = this.tabsBox.nativeElement;
  const scrollable = tabsBoxElement.scrollWidth > tabsBoxElement.clientWidth;
  const leftIcon = document.getElementById('left');
  const rightIcon = document.getElementById('right');

  if (leftIcon && rightIcon) {
    leftIcon.style.display = scrollable ? 'flex' : 'none';
    rightIcon.style.display = scrollable ? 'flex' : 'none';
  }
}
  detailItems = [
    {
      condition: () =>
          CommonUtils.doesValueExist(this.data.position.details.charge),
      iconType: 1,
      detailValue: () => this.data.position.details.charge,
      labelText: () =>
          this.data.position.details.charge === true ? "On" : "Off",
      detailText: "Power",
    },
    {
      condition: () =>
          CommonUtils.doesValueExist(this.data.position.details.ac),
      iconType: 2,
      detailValue: () => this.data.position.details.ac,
      labelText: () => (this.data.position.details.ac === true ? "On" : "Off"),
      detailText: "Ac",
    },
    {
      condition: () =>
          CommonUtils.doesValueExist(this.data.position.details.temp),
      iconType: 3,
      detailValue: () => this.data.position.details.temp,
      labelText: () => this.data.position.details.temp.toFixed(1),
      detailText: "Temperature",
    },
    {
      condition: () =>
          CommonUtils.doesValueExist(this.data.position.details.door),
      iconType: 4,
      detailValue: () => this.data.position.details.door,
      labelText: () => this.data.position.details.door,
      detailText: "Door",
    },
    {
      condition: () =>
          CommonUtils.doesValueExist(this.data.position.details.extVolt),
      iconType: 5,
      detailValue: () => this.data.position.details.extVolt,
      labelText: () => `${this.data.position.details.extVolt}V`,
      detailText: "Ext. Battery",
    },
    {
      condition: () =>
          CommonUtils.doesValueExist(this.data.position.details.intVolt),
      iconType: 5,
      detailValue: () => this.data.position.details.intVolt,
      labelText: () => `${this.data.position.details.intVolt}V`,
      detailText: "Int. Battery",
    },
    {
      condition: () =>
          CommonUtils.doesValueExist(this.data.position.details.battper),
      iconType: 10,
      detailValue: () => this.data.position.details.battper,
      labelText: () => `${this.data.position.details.battper}%`,
      detailText: "Int. Battery",
    },
    {
      condition: () => CommonUtils.doesValueExist(this.data.position.valid),
      iconType: 7,
      detailValue: () => this.data.position.valid,
      labelText: () =>
          this.data.position.valid === 1 ? "Available" : "Not Available",
      detailText: "Gps",
    },
    {
      condition: () => true,
      iconType: 8,
      detailValue: () => this.data.position.speed,
      labelText: () =>
          `${CommonUtils.checkUndefined(this.data.position.speed, 0).toFixed(
              2
          )}km/hr`,
      detailText: "Speed",
    },
    {
      condition: () => true,
      iconType: 14,
      detailValue: () => this.data.position.details.totalDistance,
      labelText: () =>
          `${(
              CommonUtils.checkUndefined(
                  this.data.position.details.totalDistance,
                  0
              ) / 1000
          ).toFixed(2)}km`,
      detailText: "Odometer",
    },
    {
      condition: () => true,
      iconType: 9,
      detailValue: () => this.data.device.details.lastOdometer,
      labelText: () =>
          `${(
              CommonUtils.checkUndefined(this.data.device.details.lastOdometer, 0) /
              1000
          ).toFixed(2)}Km`,
      detailText: "Today kms",
    },
    {
      condition: () =>
          CommonUtils.doesValueExist(this.data.position.details.armed),
      iconType: 11,
      detailValue: () => this.data.position.details.armed,
      labelText: () =>
          this.data.device.details.armed === true ? "Mobilised" : "Immobilised",
      detailText: "Vehicle status",
    },
    {
      condition: () =>
          CommonUtils.doesValueExist(this.data.position.details.wheelLock),
      iconType: 13,
      detailValue: () => this.data.position.details.wheelLock,
      labelText: () =>
          this.data.position.details.wheelLock === true ? "Lock" : "Unlock",
      detailText: "Wheel status",
    },
    {
      condition: () =>
          CommonUtils.doesValueExist(this.data.position.details.bmsSOC),
      iconType: 12,
      detailValue: () => this.data.position.details.bmsSOC,
      labelText: () => this.data.position.details.bmsSOC.toFixed(3),
      detailText: "SOC",
    },
  ];

  // tabsBox: HTMLElement | undefined;
  tabs = [
    {label: "Immobilizer", action: () => this.setImmobilizerValue()},
    {label: "Set OverSpeed Value", action: () => this.openDialogComponent()},
    {label: "History Replay", action: () => this.openDateComponent()},
    {label: "Tracking Link", action: () => this.generateTrackingLink()},
    {
      label: "Navigate In GoogleMap",
      action: () => this.openMap(),
      active: true,
    },

    // {label: "Wheel Lock", action: () => this.setWheelLockValue()},
    // {label: "Boot Unlock", action: () => this.setBootLockValue()},
  ];

  @ViewChild("tabsBox") tabsBox!: ElementRef;

  constructor(
      private pushDataService: PushDataService,
      public vehicleListRepo: VehicleListService,
      private vehicleDetailRepo: vehicleDetailRepository,
      private viewContainerRef: ViewContainerRef,
      private buttonDialogService: ButtonDialogService,
      private toastService: ToastService,
      private devicetrackingService: DevicetrackingService
  ) {
    // this.tabsBox = document.querySelector('.tabs-box') as HTMLElement;
    this.handleIcons();
    this.subscription = this.pushDataService.subscribe.subscribe((d) => {
      if (d !== null) {
        this.map = d.map;
        this.data = d.data as MapData;
      console.log(this.data)
        this.updateDeviceData(this.data.device.id);
      }
    });
    this.vehicleListRepo.removeMarkerSubject.subscribe(() => {
      this.map.removeMarker(this.marker);
      this.pathCoordinates=[]
    });
  }

  handleIcons(): void {
    if (!this.tabsBox) return;
    const maxScrollableWidth =
        this.tabsBox.nativeElement.scrollWidth -
        this.tabsBox.nativeElement.clientWidth;
    const leftIcon = document.getElementById("left");
    const rightIcon = document.getElementById("right");

    if (leftIcon) {
      leftIcon.style.display =
          maxScrollableWidth - this.tabsBox.nativeElement.scrollLeft <= 1
              ? "none"
              : "block";
    }

    if (rightIcon) {
      rightIcon.style.display =
          this.tabsBox.nativeElement.scrollLeft <= 0 ? "none" : "block";
    }
  }

  scroll(direction: string): void {
    if (!this.tabsBox) return;
    const scrollAmount = direction === "left" ? -340 : 340;
    this.tabsBox.nativeElement.scrollLeft += scrollAmount;
    this.handleIcons();
  }

  updateMarkerData(data: MapData) {
    if (!this.previousLatLng) {
      return; // If either previousLatLng or newPosition is undefined, exit the function
    }

    let speed = 500;
    let newPosition = data.position.position!;
    const steps = 100; // Number of steps for smooth movement
    const duration = speed; // Duration of movement in milliseconds
    const latStep = (newPosition.lat - (this.previousLatLng?.lat ?? 0)) / steps;
    const lngStep = (newPosition.lng - (this.previousLatLng?.lng ?? 0)) / steps;
    let currentStep = 0;

    const smoothMovementIntervalId = setInterval(() => {
      if (currentStep < steps) {
        const currentLat =
            (this.previousLatLng?.lat ?? 0) + latStep * currentStep;
        const currentLng =
            (this.previousLatLng?.lng ?? 0) + lngStep * currentStep;
        this.marker.setLatLng(L.latLng(currentLat, currentLng));
        currentStep++;
      } else {
        clearInterval(smoothMovementIntervalId);
      }
    }, duration / steps);

    this.marker.setRotationAngle(
        this.map.getBearing(this.previousLatLng, newPosition)
    );
    this.previousLatLng = data.position.position!;

    // Set the map's center to the new marker position
    this.map.setCenter(newPosition, 18); // Adjust the zoom level as needed
  }


  animateMarkerMove(marker: L.Marker, newLatLng: L.LatLng) {
    const duration = 1000; // 1 second
    const steps = 20; // Number of steps in the animation
    const stepTime = duration / steps;
    const startLatLng = marker.getLatLng();
    const latDiff = newLatLng.lat - startLatLng.lat;
    const lngDiff = newLatLng.lng - startLatLng.lng;
    let step = 0;
    const moveMarker = () => {
      if (step <= steps) {
        const lat = startLatLng.lat + (latDiff * step) / steps;
        const lng = startLatLng.lng + (lngDiff * step) / steps;
        marker.setLatLng(new L.LatLng(lat, lng));
        step++;
        setTimeout(moveMarker, stepTime);
      }
    };
    moveMarker();
  }

  ngOnInit(): void {

// debugger;
    this.subscription1 = this.vehicleListRepo.closeForm$.subscribe((isOpen) => {
      this.dateComponent = isOpen;
    });
    this.subscription2 = this.vehicleListRepo.closeDialog$.subscribe(
        (isOpen) => {
          this.dialogComponent = isOpen;
        }
    );
    this.subscription = this.vehicleListRepo.refreshDetailPage$.subscribe(
        () => {
          this.refreshPage();
        }
    );
    setTimeout(() => {
      this.getCurrentVehicleLocation();
    }, 500);
    this.applyDateRangeRestriction();

    this.selectedCommands = config.configJson.webConfig.actions;
    this.selectedOptions = config.configJson.webConfig.options;
    this.filterOptions();
    this.filterCommands();


  }

  refreshPage() {
    this.updateDeviceData(this.deviceId); // Add your function logic here
  }

  filterCommands() {
    this.tabs = this.tabs.filter((tab) => {
      switch (tab.label) {
        case "Wheel Lock":
          return this.selectedCommands.wheelLock;
        case "Boot Unlock":
          return this.selectedCommands.bootLock;
        case "Immobilizer":
          return this.selectedCommands.immobilizer;
        case "History Replay":
          return this.selectedCommands.historyReplay;
        case "Tracking Link":
          return this.selectedCommands.trackingLink;
        case "Navigate In GoogleMap":
          return this.selectedCommands.navigateToGoogle;
        case "Set OverSpeed Value":
          return this.selectedCommands.setOverSpeed;

        default:
          return false;
      }
    });
  }

  filterOptions() {

    this.detailItems = this.detailItems.filter((option) => {
      switch (option.detailText) {
        case "Power":
          return this.selectedOptions.power;
        case "Ac":
          return this.selectedOptions.ac;
        case "Temperature":
          return this.selectedOptions.temperature;
        case "Door":
          return this.selectedOptions.door;
        case "Ext. Battery":
          return this.selectedOptions.extBattery;
        case "Int. Battery":
          return this.selectedOptions.intBattery;
        case "Gps":
          return this.selectedOptions.gps;
        case "Speed":
          return this.selectedOptions.speed;
        case "Odometer":
          return this.selectedOptions.odometer;
        case "Today kms":
          return this.selectedOptions.todayKms;
        case "Vehicle status":
          return this.selectedOptions.immobilizer;
        case "Wheel status":
          return this.selectedOptions.wheelLock;
        case "SOC":
          return this.selectedOptions.bmsSOC;
        case "Set OverSpeed Value": //yet to confirm for battery
          return this.selectedOptions.setOverSpeed;
        default:
          return false;
      }
    });
  }

  applyDateRangeRestriction() {
    this.vehicleListRepo.setRestrictDateRange(true, false);
  }

  getCurrentVehicleLocation(): void {
    this.detailData = true;
    this.deviceId = this.data.device.id;
    this.interval = setInterval(() => {
      this.updateDeviceData(this.deviceId);
    }, 10000);
    this.detailData = false;
  }
  updateDeviceData(deviceId: number) {
    this.deviceId = deviceId;
    this.vehicleDetailRepo.getVehicleByIdData(this.deviceId).subscribe(
        (data) => {
          this.data = data.data;
          this.address = data.address;
          const lat = data.data.position.position.lat;
          const lon = data.data.position.position.lng;
          const newLatLng = new L.LatLng(lat, lon);
          this.pathCoordinates.push(newLatLng);
          if (this.polyline) {
            this.polyline.setLatLngs(this.pathCoordinates);
          } else {
            this.polyline = L.polyline(this.pathCoordinates, {color: 'green'}).addTo(this.map.map);
          }
          if (this.marker) {
            this.map.updateMarkerOnMap(this.marker, data.data)
            this.animateMarkerMove(this.marker, newLatLng);
    
          } else {
            this.map.map.setView([lat, lon], 18);

            this.marker = this.map.drawMarkerOnMap(data.data, () => {
            });
            this.marker.addTo(this.map.map);
          }
          this.map.map.panTo(newLatLng);
        },
        () => {
        }
    );
  }

  generateTrackingLink() {
    this.devicetrackingService
        .open(this.viewContainerRef, this.deviceId)
        .subscribe((d: any) => {
        });
  }

  setWheelLockValue() {
    this.buttonDialogService
        .open(
            this.viewContainerRef,
            "Press Below button for next action",
            "Wheel Lock ON",
            "Wheel lock Off",
            "assets/dialogBoximages/wheel_illus.png"
        )
        .subscribe((result) => {
          if (result == "yes") {
            this.sendDeviceCommand(this.deviceId, "custom", "*GIPL,WLOCK,$");
          } else if (result == "no") {
            this.sendDeviceCommand(this.deviceId, "custom", "*GIPL,WULOCK,$");
          } else {
            console.log("Dialog was cancelled");
          }
        });
  }

  setBootLockValue() {
    this.buttonDialogService
        .open(
            this.viewContainerRef,
            "Press Below button for next action",
            "Boot Unlock",
            "No",
            "assets/dialogBoximages/boot_lock.png"
        )
        .subscribe((result) => {
          if (result == "yes") {
            this.sendDeviceCommand(this.deviceId, "custom", "*GIPL,BULOCK,$");
          } else {
            console.log("Dialog was cancelled");
          }
        });
  }

  setImmobilizerValue() {
    this.buttonDialogService
        .open(
            this.viewContainerRef,
            "Press Below button for next action",
            "Mobilize",
            "Immobilize",
            "assets/dialogBoximages/key-moblisezd.png"
        )
        .subscribe((result) => {
          if (result == "yes") {
            this.sendDeviceCommand(this.deviceId, "engineResume", undefined);
          } else if (result == "no") {
            this.sendDeviceCommand(this.deviceId, "engineStop", undefined);
          } else {
            console.log("Dialog was cancelled");
          }
        });
  }

  sendDeviceCommand(
      deviceId: number,
      commandType: string,
      command: string | undefined = undefined
  ): void {
    this.vehicleDetailRepo
        .setimmobilizerData(deviceId, commandType, command)
        .subscribe({
          next: (d) => {
            this.toastService.toastMessage("success", "Success", d.data);
          },
          error: (e: any) => {
            this.toastService.toastMessage("error", "Message", e.error.data);
          },
        });
  }


  nextRechargeDate(differenceMs: number): string {
    const days = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
    //

    // Format the result into a string
    let result = "";
    if (days > 0) {
      result += `${days} day${days > 1 ? "s" : ""} `;
    }

    return result.trim();
  }

  convertData(nextRechargeDate: string): number {
    return parseInt(nextRechargeDate);
  }

  lastUpDated(differenceMs: number): string {
    // Convert milliseconds to seconds
    const differenceSeconds = Math.floor(differenceMs / 1000);

    // Calculate individual units
    const days = Math.floor(differenceSeconds / 86400); // 1 day = 24 * 60 * 60 seconds
    const hours = Math.floor((differenceSeconds % 86400) / 3600);
    const minutes = Math.floor((differenceSeconds % 3600) / 60);
    const seconds = differenceSeconds % 60;

    // Generate the formatted string
    let formattedString = "";
    if (days > 0) {
      formattedString += `${days}day${days > 1 ? "s" : ""} `;
    }
    if (hours > 0) {
      formattedString += `${hours}hr${hours > 1 ? "s" : ""} `;
    }
    if (minutes > 0) {
      formattedString += `${minutes}min${minutes > 1 ? "s" : ""} `;
    }
    if (seconds > 0 || formattedString === "") {
      formattedString += `${seconds}sec${seconds > 1 ? "s" : ""} `;
    }

    formattedString += "ago";

    return formattedString.trim();
  }

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }

    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.subscription1) {
      this.subscription1.unsubscribe();
    }
    if (this.subscription2) {
      this.subscription2.unsubscribe();
    }
  }

  convertTimeDuration(input: string | undefined): string | undefined {
    return CommonUtils.convertTimeDuration(input);
  }

  openDateComponent() {
    this.dateComponent = true;
  }

  openDialogComponent() {
    this.dialogComponent = true;
    this.vehicleListRepo.testDevideID = this.deviceId;
  }

  closePopupForm(isClosed: boolean) {
    this.dateComponent = isClosed;
  }

  openMap() {
    const url = `https://www.google.com/maps?q=${this.coordinates.lat},${this.coordinates.lng}`;
    window.open(url, "_blank"); // Open in a new tab/window
  }

  protected readonly CommonUtils = CommonUtils;
}
