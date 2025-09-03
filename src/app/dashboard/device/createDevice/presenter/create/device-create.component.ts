import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
// import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import * as moment from "moment";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Device } from "../../../../../models/device";
import { DeviceService } from "../../../../../service/device.service";
import { User } from "../../../../user/models/user.model";
import { ActivatedRoute, Router } from "@angular/router";
import { finalize } from "rxjs";
import { createDeviceRepository } from "../../domain/createDevice.repository";
import { ToastService } from "src/app/service/toast.service";
import { config } from "src/config";
@Component({
  templateUrl: "./device-create.component.html",
  styleUrls: ["./device-create.component.scss"],
  providers: [createDeviceRepository],
})
export class deviceCreateComponent implements OnInit{
  deviceId: number = 0;
  userId: number = 0;
  deviceForm!: FormGroup;
  users: User[] = [];
  isLoading = false;
  buttonText = "Create Device";
  additionalData!: {};
  private sub: any;
  isSubmitted: boolean = false;
  activeTabIndex: number = 0; // Property to manage the active tab
  layout: number = 0;
  @ViewChild('barcodeInput') barcodeInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public deviceService: DeviceService,

    private router: Router,
    private createDeviceRepo: createDeviceRepository,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.layout = config.layout;
    this.sub = this.route.queryParams.subscribe((v) => {
      this.deviceId = v["deviceId"] || 0;
      this.userId = Number(v["userId"]) || 0;
      if (this.deviceId != 0) {
        this.getDeviceDetailsAndPatch(this.deviceId);
        this.buttonText = "Update Device";
      }
      this.createForm();
    });
  }


  getDeviceDetailsAndPatch(id: any) {
    if (id != 0) {
      this.createDeviceRepo
        .getAndPatchDeviceData(id)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: (d) => {
            this.additionalData = d[0].attribute;
            this.deviceForm.patchValue(d[0]);
          },
          error: (e) => {
            this.toastService.toastMessage("error", "Message", e.error.data);
          },
        });
    }
  }


  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  createForm(): void {
    this.deviceForm = this.fb.group({
      id: [0],
      fkDeviceType: [1],
      deviceId: ["", Validators.required],
      deviceImei: ["", Validators.required],
      deviceUid: null,
      simPhoneNumber: ["", Validators.required],
      simSecPhoneNumber: [""],
      fkSimOperator: [1],
      fkSecSimOperator: [2],
      fkVehicleType: [1],
      vehicleNo: ["", Validators.required],
      description: [""],
      installationOn: [moment().format("YYYY-MM-DD")],
      lastUpdateOn: [moment().format("YYYY-MM-DDTHH:mm:ss.SSSSSSS[Z]")],
      creationTime: [moment().format("YYYY-MM-DDTHH:mm:ss.SSSSSSS[Z]")],
    });
  }
  onTabChange(event: any) {
    // Example logic to set different data based on which tab is selected

    if (event.index === 1 && this.deviceId) {
      this.deviceService.changeDeviceImei(
        this.deviceForm.get("deviceImei")?.value
      ); // Store the deviceImei
    }
  }
  createDevice(device: any): void {
    
    device = this.trimFormValues(device);
    this.createDeviceRepo
      .createDeviceData(device, this.userId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (d) => {
          this.router.navigate(["/device", "Device created successfully"]);
        },
        error: (e) => {
          this.toastService.toastMessage("error", "Message", e.error.data);
        },
      });
  }

  updateDevice(device: Device): void {
    device.attribute = this.additionalData;
    device = this.trimFormValues(device);
    this.createDeviceRepo.updateDeviceData(device.id, device).subscribe({
      next: (d) => {
        this.router.navigate(["/device", "Device updated successfully"]);
      },
      error: (e) => {
        this.toastService.toastMessage("error", "Message", e.error.data);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  onSubmit() {
    this.isSubmitted = true;
    this.isLoading = true;
    const device = this.deviceForm.value as Device;
    if (this.deviceForm.valid) {
      if (this.deviceId == 0) {
        this.createDevice(device);
      } else {
        this.updateDevice(device);
      }
    }
  }

  trimFormValues(device: any): any {
    // Trim all string values in the object
    for (const key in device) {
      if (typeof device[key] === "string") {
        device[key] = device[key].trim();
      }
    }
    return device;
  }

  cancel() {
    this.router.navigate(["/device", "null"]);
  }
}
