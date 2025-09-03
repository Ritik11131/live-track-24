import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms"; // Import ReactiveFormsModule
import { customerUpdateDeviceRepository } from "../../domain/updateDevice.repository";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
} from "@angular/forms";
import { DropdownModule } from "primeng/dropdown";
import { DeviceService } from "src/app/service/device.service";
import { MessageService } from "primeng/api";
import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";
import { Device } from "src/app/models/device";
import { CommonUtils } from "src/app/utils/commonUtils";
import { ToastService } from "src/app/service/toast.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-update",
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./update.component.html",
  styleUrls: ["./update.component.scss"],
  providers: [customerUpdateDeviceRepository],
})
export class UpdateComponent implements OnInit {
  deviceId: number = 0;
  @Output() closeUpdateForm = new EventEmitter<boolean>();

  userUpdateForm!: FormGroup;
  device!: Device;

  constructor(
    private fb: FormBuilder,
    public deviceService: DeviceService,
    private messageService: MessageService,
    private customerUpdateDeviceRepo: customerUpdateDeviceRepository,
    private toastService: ToastService,
    private router: Router,

  ) {
    this.userUpdateForm = this.fb.group({
      speedLimit: new FormControl("", [Validators.required]),
      vehicleNo: new FormControl("", [Validators.required]),
      vehicleType: new FormControl("", [Validators.required]),
    });
  }

  ngOnInit() {
    this.deviceService.idValue.subscribe((values) => {
      (this.deviceId = values.deviceId),
        this.getDeviceDetailsAndPatch(this.deviceId);
    });
  }

  getDeviceDetailsAndPatch(id: any) {
    if (id != 0) {
      this.customerUpdateDeviceRepo.getAndPatchDeviceData(id).subscribe({
        next: (d) => {
          this.device = d[0];

          this.userUpdateForm.patchValue({
            speedLimit: d[0].attribute.speedLimit,
            vehicleNo: d[0].vehicleNo,
            vehicleType: d[0].fkVehicleType,
          });
        },
        error: (e) => {
          this.toastService.toastMessage("error","Message", e.error.data);
        },
      });
    }
  }

  saveChanges() {
    const updatedDevice: Device = {
      ...this.device,
      attribute: {
        ...this.device.attribute,
        speedLimit: this.userUpdateForm.get("speedLimit")?.value,
      },
      vehicleNo: this.userUpdateForm.get("vehicleNo")?.value,
      fkVehicleType: this.userUpdateForm.get("vehicleType")?.value,
    };
    this.device = this.trimFormValues(updatedDevice);
    console.log(updatedDevice);

    this.customerUpdateDeviceRepo
      .updateDeviceData(this.deviceId, this.device)
      .subscribe({
        next: (d) => {
          this.deviceService.customerDeviceUpdated();
          this.cancel();
          this.router.navigate(["/device","Device created successfully"]);
        },
        error: (e) => {
          this.toastService.toastMessage("error","Message", e.error.data);
        },
      });
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

  cancel(): void {
    this.closeUpdateForm.emit(false);
  }
}
