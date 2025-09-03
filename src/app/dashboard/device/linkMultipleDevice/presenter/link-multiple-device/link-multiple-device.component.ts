import { AfterViewInit, Component, OnInit } from "@angular/core";
import { InputTextModule } from "primeng/inputtext";
import { RippleModule } from "primeng/ripple";
import { ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { Device } from "src/app/models/device";
import { linkMultipleDeviceRepository } from "../../domain/linkMultipleDevice.repository";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
} from "@angular/forms";
import { LinkMultipleDeviceService } from "../../domain/link-multiple-device.service";
import { ReactiveFormsModule } from "@angular/forms";
import { User } from "src/app/dashboard/user/models/user.model";
import { CommonModule } from "@angular/common";
import { BillingPlan } from "src/app/dashboard/billingPlanModule/billingPlans/domain/billingPlan.model";
import { BillingPlanRepository } from "src/app/dashboard/billingPlanModule/billingPlans/domain/billing-plans.repository";
@Component({
  selector: "app-link-multiple-device",
  standalone: true,
  imports: [
    InputTextModule,
    FormsModule,
    RippleModule,
    ButtonModule,
    ReactiveFormsModule,
    CommonModule,
    DropdownModule,
  ],
  templateUrl: "./link-multiple-device.component.html",
  styleUrl: "./link-multiple-device.component.scss",
  providers: [linkMultipleDeviceRepository, BillingPlanRepository],
})
export class LinkMultipleDeviceComponent implements OnInit {
  billingPLans!: BillingPlan[];

  devices!: Device[];
  devicesLinkForm!: FormGroup;
  deviceId: number[] = [];
  users: User[] = [];
  title: string = "Link Multiple Devices";
  constructor(
    private fb: FormBuilder,
    private billingPlanRepo: BillingPlanRepository,

    private linkMultipleDeviceService: LinkMultipleDeviceService,
    private linkMultipleDeviceRepo: linkMultipleDeviceRepository
  ) {
    this.devicesLinkForm = this.fb.group({
      deviceId: new FormControl("", [
        Validators.required,
        Validators.minLength(4),
      ]),
      users: [[]],
      selectedId: new FormControl(),
    });
  }

  ngOnInit(): void {
    if (this.title === "Link Multiple Devices") {
      this.getUserList();
    } else {
      this.getCustomerPlan();
    }
    this.patchValues(this.devices);
  }
  patchValues(devices: Device[]) {
    const deviceIds = this.devices.map((device) => device.vehicleNo);
    this.devicesLinkForm.patchValue({ deviceId: deviceIds });
  }
  getCustomerPlan() {
    this.billingPlanRepo.getCustomerPlan().subscribe(
      (data: BillingPlan[]) => {
        this.billingPLans = data;
      },
      (error) => {}
    );
  }
  getUserList(): void {
    // Fetch all users
    this.linkMultipleDeviceRepo.getUserData().subscribe((allUsers) => {
      this.users = allUsers;
    });
  }
  onConfirm() {
    if (this.title === "Link Multiple Devices") {
      const deviceIds = this.devices.map((x) => x.id);
      const selectedIds = this.devicesLinkForm.get("selectedId")?.value.id;
      this.linkDevices([selectedIds], deviceIds).then((r) => {});
    } else {
      const deviceIds = this.devices.map((x) => x.id);

      const payload={
        device:deviceIds,
        planId:this.devicesLinkForm.get("selectedId")?.value.id
      }
      this.linkMultipleDeviceService.linkPlans(payload).subscribe(
        (data) => {
          console.log(data);
          this.linkMultipleDeviceService.close("yes");
        },
        (error: any) => {
          this.linkMultipleDeviceService.close(error);
        }
      );
    }
  }
  async linkDevices(userid: number[], ids: number[]) {
    try {
      const linkDevicePromises = ids.map((id) =>
        this.linkMultipleDeviceRepo.linkUserData(userid, id).toPromise()
      );
      await Promise.all(linkDevicePromises);
      this.linkMultipleDeviceService.close("yes");
    } catch (error) {
      console.error("Error:", error);
    }
  }
  onCancel() {
    this.linkMultipleDeviceService.close("no");
  }
}
