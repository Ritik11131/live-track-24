import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { config } from "src/config";
import * as L from "leaflet";
import { VehicleDetailViewModel } from "src/app/viewModels/vehicleDetail.viewModel";
import { MapUtils } from "src/app/dashboard/commonComponents/common";
import { ButtonDialogService } from "src/app/dashboard/commonComponents/buttonDialog/domain/buttonDailog.service";
import { ToastService } from "src/app/service/toast.service";
import { DatePickerViewModel } from "src/app/viewModels/datePicker.viewModel";
import { OverSpeedDialogViewModel } from "src/app/viewModels/setOverSpeed.viewModel";
import { DevicetrackingService } from "../../trackingLink/domain/devicetracking.service";
import { VehicleDetailResponse } from "src/app/domain/tracking/vehicleDetailResponse";
@Component({
  selector: "app-live-track",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./live-track.component.html",
  styleUrl: "./live-track.component.scss",
})
export class LiveTrackComponent {
  @ViewChild("tabsBox") tabsBox!: ElementRef;
  @Input() vehicleid!: number;
  @Input() map!:L.Map;
  data!:VehicleDetailResponse;
  private marker!: L.Marker;
  private polyline!: L.Polyline;
  interval!:any;
  private pathCoordinates: L.LatLng[] = [];
  @Output() dateRange= new EventEmitter<string>();

  tabs = [
    { label: "Immobilizer", action: () => this.setImmobilizerValue() },
    { label: "Set OverSpeed Value", action: () => this.openDialogComponent() },
    { label: "History Replay", action: () => this.openDateComponent() },
    {
      label: "Navigate In GoogleMap",
      action: () => this.openMap(),
      active: true,
    },
    { label: "Tracking Link", action: () => this.generateTrackingLink() },
    // { label: "Wheel Lock", action: () => this.setWheelLockValue() },
    // { label: "Boot Unlock", action: () => this.setBootLockValue() },
  ];
  constructor(
    private toastService: ToastService,
    private devicetrackingService: DevicetrackingService,
    private overSpeedDialogViewModel: OverSpeedDialogViewModel,
    private viewContainerRef: ViewContainerRef,
    private buttonDialogService: ButtonDialogService,
    private datePickerViewModel: DatePickerViewModel,
    private vehicleDetailViewModel:VehicleDetailViewModel
  ) {
    this.handleIcons();
    setTimeout(() => {
      
      this.updateDeviceData(this.vehicleid);
    }, 300);

    this.interval = setInterval(() => {
      this.updateDeviceData(this.vehicleid);
    }, 10000);

  }
  updateDeviceData(deviceId: number) {
    console.log(deviceId)
    const payload = { id: deviceId };
    this.vehicleDetailViewModel.getVehicleById(payload).subscribe(
        (response) => {
          console.log(response.data)
          this.data = response;
          const lat = response.data.position.latitude;
          const lon = response.data.position.longitude;
          const newLatLng = new L.LatLng(lat, lon);
          this.pathCoordinates.push(newLatLng);
          if (this.polyline) {
            this.polyline.setLatLngs(this.pathCoordinates);
          } else {
            this.polyline = L.polyline(this.pathCoordinates, {color: 'green'}).addTo(this.map);
          }
          if (this.marker) {
            MapUtils.updateMarkerOnMap(this.marker, response.data)
            this.animateMarkerMove(this.marker, newLatLng);
    
          } else {
            this.marker = MapUtils.drawMarkerOnMap(response.data, () => {
            });
            this.marker.addTo(this.map);
          }
          this.map.panTo(newLatLng);
        },
        (error) => {
        }
    );
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

  scroll(direction: string): void {
    if (!this.tabsBox) return;
    const scrollAmount = direction === "left" ? -340 : 340;
    this.tabsBox.nativeElement.scrollLeft += scrollAmount;
    this.handleIcons();
  }
  handleIcons(): void {
    if (!this.tabsBox) return;
    const maxScrollableWidth =
      this.tabsBox.nativeElement.scrollWidth -
      this.tabsBox.nativeElement.clientWidth;
    const leftIcon = document.getElementById("left");
    const rightIcon = document.getElementById("right");
    console.log(this.tabsBox.nativeElement.scrollLeft);
    console.log(maxScrollableWidth - this.tabsBox.nativeElement.scrollLeft);
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
          this.sendDeviceCommand(this.vehicleid, "custom", "*GIPL,WLOCK,$");
        } else if (result == "no") {
          this.sendDeviceCommand(this.vehicleid, "custom", "*GIPL,WULOCK,$");
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
          this.sendDeviceCommand(this.vehicleid, "custom", "*GIPL,BULOCK,$");
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
          this.sendDeviceCommand(this.vehicleid, "engineResume", undefined);
        } else if (result == "no") {
          this.sendDeviceCommand(this.vehicleid, "engineStop", undefined);
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
    const payload = {
      deviceId: deviceId,
      commandType: commandType,
      command: command
    };
    this.vehicleDetailViewModel
        .sendCommand(payload)
        .subscribe({
          next: (d) => {
            this.toastService.toastMessage("success", "Success", d.data);
          },
          error: (e: any) => {
            this.toastService.toastMessage("error", "Message", e.error.data);
          },
        });
  }
  openMap() {
    // const url = `https://www.google.com/maps?q=${this.coordinates.lat},${this.coordinates.lng}`;
    // window.open(url, "_blank"); // Open in a new tab/window
  }
  generateTrackingLink() {
    this.devicetrackingService
      .open(this.viewContainerRef, this.vehicleid)
      .subscribe((d: any) => {});
  }
  openDialogComponent() {
    this.overSpeedDialogViewModel
      .open(this.viewContainerRef, this.vehicleid)
      .subscribe((result) => {
        if (result == "yes") {
          this.toastService.showSuccessToast(
            "The overSpeed value has been set Successfully"
          );
        } else if (result == "no") {
          this.toastService.showSuccessToast(
            "Some error occured while setting the over speed value"
          );
        }
      });
  }
  openDateComponent() {
    this.datePickerViewModel
      .open(this.viewContainerRef, false)
      .subscribe((result) => {
        console.log(result);
        if(result!==null){
        this.dateRange.emit(result)}
        MapUtils.clear(this.map,this.marker,this.polyline);

        if (result == " ") {

          this.toastService.showSuccessToast(
            "The overSpeed value has been set Successfully"
          );
        } else if (result == "no") {
          this.toastService.showSuccessToast(
            "Some error occured while setting the over speed value"
          );
        }
      });
  }
  stopLiveTrack() {
    clearInterval(this.interval);
  }
  ngOnDestroy() {
    this.stopLiveTrack();
  }
}
