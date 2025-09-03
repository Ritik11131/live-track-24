import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { CheckboxModule } from "primeng/checkbox";
import { ButtonModule } from "primeng/button";
import { FirebaseService } from "src/app/firebase_service/firebase.service";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "../../../services/user.service";
import { ToastService } from "src/app/service/toast.service";
import {ConfigurationDetailRepositiory} from "../../domain/configurationDetail.repositiory"
@Component({
  selector: "app-configuration-detail",
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, CheckboxModule, ButtonModule],
  templateUrl: "./configuration-detail.component.html",
  styleUrls: ["./configuration-detail.component.scss"],
  providers:[ConfigurationDetailRepositiory]
})
export class ConfigurationDetailComponent implements OnInit {
  userForm!: FormGroup;
  fkUserId: number=0;
  userId: number = 0;
id!:number;
  webConfigReports = [
    { label: "Temperature Report", value: "temperatureReport" },
    { label: "Distance Report", value: "distanceReport", defaultValue: true },
    { label: "Overspeed Report", value: "overspeedReport", defaultValue: true },
    { label: "Trip Report", value: "tripReport", defaultValue: true },
    { label: "Idle Report", value: "idleReport", defaultValue: true },
    { label: "Stop Report", value: "stopReport", defaultValue: true },
    { label: "SOC Report", value: "socReport" },
    { label: "AC Report", value: "acReport" },
    { label: "Total Distance Report", value: "totalDistanceReport" },
    { label: "Detail Report", value: "detailReport" },
  ];

  webConfigActions = [
    { label: "Wheel Lock", value: "wheelLock" },
    { label: "Boot Lock", value: "bootLock" },
    { label: "Immobilizer", value: "immobilizer" },
    { label: "History Replay", value: "historyReplay", defaultValue: true },
    { label: "Tracking Link", value: "trackingLink", defaultValue: true },
    { label: "Navigate To Google", value: "navigateToGoogle", defaultValue: true },
    { label: "Set OverSpeed", value: "setOverSpeed", defaultValue: true },

  ];

  webConfigOptions = [
    { label: "Power", value: "power", defaultValue: true },
    { label: "AC", value: "ac" },
    { label: "Temperature", value: "temperature" },
    { label: "Door", value: "door" },
    { label: "External Battery", value: "extBattery" },
    { label: "Internal Battery", value: "intBattery" },
    { label: "GPS", value: "gps", defaultValue: true },
    { label: "Speed", value: "speed", defaultValue: true },
    { label: "Odometer", value: "odometer", defaultValue: true },
    { label: "Today Kms", value: "todayKms", defaultValue: true },
    { label: "Immobilizer", value: "immobilizer" },
    { label: "Wheel Lock", value: "wheelLock" },
    { label: "Soc", value: "bmsSOC" },
  ];

  webConfigPermissions=[
    {label:"Delete User",value:"deleteDevice"},
    {label:"Create Dealer",value:"createDealer"},

  ]
  androidConfigReports = [
    { label: "Temperature Report", value: "temperatureReport" },
    { label: "Distance Report", value: "distanceReport", defaultValue: true },
    { label: "Overspeed Report", value: "overspeedReport", defaultValue: true },
    { label: "Trip Report", value: "tripReport", defaultValue: true },
    { label: "Idle Report", value: "idleReport", defaultValue: true },
    { label: "Stop Report", value: "stopReport", defaultValue: true },
    { label: "SOC Report", value: "socReport" },
    { label: "AC Report", value: "acReport" },
    { label: "Total Distance Report", value: "totalDistanceReport" },
    { label: "Detail Report", value: "detailReport" },
  ];

  androidConfigActions = [
    { label: "Wheel Lock", value: "wheelLock" },
    { label: "Boot Lock", value: "bootLock" },
    { label: "Immobilizer", value: "immobilizer" },
    { label: "History Replay", value: "historyReplay", defaultValue: true },
    { label: "Tracking Link", value: "trackingLink", defaultValue: true },
    { label: "Navigate To Google", value: "navigateToGoogle", defaultValue: true },
    { label: "Set OverSpeed", value: "setOverSpeed", defaultValue: true },
  ];

  androidConfigOptions = [
    { label: "Power", value: "power", defaultValue: true },
    { label: "AC", value: "ac" },
    { label: "Temperature", value: "temperature" },
    { label: "Door", value: "door" },
    { label: "External Battery", value: "extBattery" },
    { label: "Internal Battery", value: "intBattery" },
    { label: "GPS", value: "gps", defaultValue: true },
    { label: "Speed", value: "speed", defaultValue: true },
    { label: "Odometer", value: "odometer", defaultValue: true },
    { label: "Today Kms", value: "todayKms", defaultValue: true },
    { label: "Immobilizer", value: "immobilizer" },
    { label: "Wheel Lock", value: "wheelLock" },
    { label: "Soc", value: "bmsSOC" },
  ];

  androidConfigPermissions=[
    {label:"Delete User",value:"deleteDevice"},
    {label:"Create Dealer",value:"createDealer"},
  ]
  constructor(
      private toastService:ToastService,
      private fb: FormBuilder,
      private firebaseService: FirebaseService,
      private router: Router,
      private route: ActivatedRoute,
      private userService: UserService,
      private configurationDetailRepo:ConfigurationDetailRepositiory
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      webConfig: this.fb.group({
        reports: this.fb.group({}),
        actions: this.fb.group({}),
        options: this.fb.group({}),
        permissions:this.fb.group({}),
      }),
      androidConfig: this.fb.group({
        reports: this.fb.group({}),
        actions: this.fb.group({}),
        options: this.fb.group({}),
        permissions: this.fb.group({}),
      }),
    });

    this.userService.currentuserLoginId.subscribe((id: number) => {
      if (id) {
        console.log(id)
        this.fkUserId = id;
      }
      console.log(id);
    });

    this.addControls(this.webConfigReports, 'webConfig', 'reports');
    this.addControls(this.webConfigActions, 'webConfig', 'actions');
    this.addControls(this.webConfigOptions, 'webConfig', 'options');
    this.addControls(this.webConfigPermissions, 'webConfig', 'permissions');
    this.addControls(this.androidConfigReports, 'androidConfig', 'reports');
    this.addControls(this.androidConfigActions, 'androidConfig', 'actions');
    this.addControls(this.androidConfigOptions, 'androidConfig', 'options');
    this.addControls(this.androidConfigPermissions, 'androidConfig', 'permissions');

    this.route.queryParams.subscribe((v) => {
      this.userId = v["userId"] || 0;
      if (this.userId != 0) {
        this.loadUserConfig();
      }
    });
  }

  addControls(options: any[], groupName: string, subGroupName: string) {
    options.forEach((option) => {
      const defaultValue = option.defaultValue || false;
      const subGroup = (this.userForm.get(groupName) as FormGroup).get(subGroupName) as FormGroup;
      subGroup.addControl(option.value, this.fb.control(defaultValue));
    });
  }

  loadUserConfig() {
    if (this.fkUserId) {
      try {
        this.configurationDetailRepo.getConfigData(this.fkUserId).subscribe((data) => {
          console.log(data);
          this.id=data.id;
          this.populateForm(JSON.parse(data.attributes));
        });
      } catch (error) {
        console.error("Error loading device config:", error);
      }
    }
  }

  populateForm(config: any) {
    if (config) {
      const webConfigGroup = this.userForm.get("webConfig") as FormGroup;
      const androidConfigGroup = this.userForm.get("androidConfig") as FormGroup;

      // Process webConfig
      if (config.webConfig) {
        this.processConfigGroup(config.webConfig.reports, webConfigGroup.get('reports') as FormGroup);
        this.processConfigGroup(config.webConfig.actions, webConfigGroup.get('actions') as FormGroup);
        this.processConfigGroup(config.webConfig.options, webConfigGroup.get('options') as FormGroup);
        this.processConfigGroup(config.webConfig.permissions, webConfigGroup.get('permissions') as FormGroup);

      } else {
        console.warn("webConfig is undefined or null");
      }
      // Process androidConfig
      if (config.androidConfig) {
        this.processConfigGroup(config.androidConfig.reports, androidConfigGroup.get('reports') as FormGroup);
        this.processConfigGroup(config.androidConfig.actions, androidConfigGroup.get('actions') as FormGroup);
        this.processConfigGroup(config.androidConfig.options, androidConfigGroup.get('options') as FormGroup);
        this.processConfigGroup(config.androidConfig.permissions, androidConfigGroup.get('permissions') as FormGroup);

      } else {
        console.warn("androidConfig is undefined or null");
      }
    } else {
      console.warn("Config is undefined or null");
    }
  }

  processConfigGroup(configData: any, formGroup: FormGroup) {
    if (configData && formGroup) {
      Object.keys(configData).forEach((key) => {
        if (formGroup.contains(key)) {
          formGroup.get(key)?.setValue(configData[key]);
        } else {
          formGroup.addControl(key, this.fb.control(configData[key]));
        }
      });
    }
  }

  async onSubmit() {
    const webConfigValue = this.userForm.get("webConfig")?.value;
    const androidConfigValue = this.userForm.get("androidConfig")?.value;
  
    const configData = {
      webConfig: {
        reports: webConfigValue.reports,
        actions: webConfigValue.actions,
        options: webConfigValue.options,
        permissions: webConfigValue.permissions,
      },
      androidConfig: {
        reports: androidConfigValue.reports,
        actions: androidConfigValue.actions,
        options: androidConfigValue.options,
        permissions: androidConfigValue.permissions,
      },
    };
  
    // Convert attributes to JSON string
    const attributesString = JSON.stringify(configData);
  
    // Prepare the final data object
    const finalData = {
      id: this.id,
      fkUserId: this.fkUserId,
      attributes: attributesString, // Assign the JSON string to the attributes field
    };
  
    console.log(finalData);
  
    if (this.fkUserId) {
      try {
        await this.configurationDetailRepo.sendConfigData(finalData).subscribe(
          (data) => {
            console.log(data);
          },
          (error: any) => {
            console.log(error);
          }
        );
      } catch (error) {
        console.error(error);
      }
    }
  
    if (this.userId) {
      this.router.navigate(["/user", "Device updated successfully"]);
    } else {
      this.router.navigate(["/user", "Device created successfully"]);
    }
  }
  
  checkId(event: MouseEvent) {
    if (!this.fkUserId) {
      event.preventDefault();
      this.toastService.toastMessage("error","Error","Create the user first") }
  }

  cancel() {
    window.history.back();
  }
}
