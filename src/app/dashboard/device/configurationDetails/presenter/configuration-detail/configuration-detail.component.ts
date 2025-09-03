import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { CheckboxModule } from "primeng/checkbox";
import { ButtonModule } from "primeng/button";
import { DeviceService } from "src/app/service/device.service";
import { FirebaseService } from "src/app/firebase_service/firebase.service";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-configuration-detail",
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, CheckboxModule, ButtonModule],
  templateUrl: "./configuration-detail.component.html",
  styleUrls: ["./configuration-detail.component.scss"],
})
export class ConfigurationDetailComponent implements OnInit {
  userForm!: FormGroup;
  deviceImei!: any;
  deviceId: number = 0;

  webConfigOptions = [
    { label: "Temperature Report", value: "temperatureReport" },
    { label: "Distance Report", value: "distanceReport" },
    { label: "Overspeed Report", value: "overspeedReport" },
    { label: "Trip Report", value: "tripReport" },
    { label: "Idle Report", value: "idleReport" },
    { label: "Stop Report", value: "stopReport" },
    { label: "AC Report", value: "acReport" },
    { label: "Parking Mode", value: "parkingMode" },
    { label: "Immobilizer", value: "immobilizer" },
    { label: "Ignition", value: "ignition" },
    { label: "Power", value: "power" },
    { label: "AC", value: "ac" },
    { label: "Temperature", value: "temperature" },
    { label: "Door", value: "door" },
    { label: "External Battery", value: "extBattery" },
    { label: "Internal Battery", value: "intBattery" },
    { label: "GPS", value: "gps" },
    { label: "Speed", value: "speed" },
    { label: "Odometer", value: "odometer" },
    { label: "Total Distance", value: "totalDistance" },
  ];

  androidConfigOptions = [
    { label: "Temperature Report", value: "temperatureReport" },
    { label: "Distance Report", value: "distanceReport" },
    { label: "Overspeed Report", value: "overspeedReport" },
    { label: "Trip Report", value: "tripReport" },
    { label: "Idle Report", value: "idleReport" },
    { label: "Stop Report", value: "stopReport" },
    { label: "AC Report", value: "acReport" },
    { label: "Parking Mode", value: "parkingMode" },
    { label: "Immobilizer", value: "immobilizer" },
    { label: "Ignition", value: "ignition" },
    { label: "Power", value: "power" },
    { label: "AC", value: "ac" },
    { label: "Temperature", value: "temperature" },
    { label: "Door", value: "door" },
    { label: "External Battery", value: "extBattery" },
    { label: "Internal Battery", value: "intBattery" },
    { label: "GPS", value: "gps" },
    { label: "Speed", value: "speed" },
    { label: "Odometer", value: "odometer" },
    { label: "Total Distance", value: "totalDistance" },
  ];

  constructor(
    private fb: FormBuilder,
    private deviceService: DeviceService,
    private firebaseService: FirebaseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
 
    this.userForm = this.fb.group({
      webConfig: this.fb.group({}),
      androidConfig: this.fb.group({}),
    });
    this.deviceService.currentDeviceImei.subscribe((deviceImei) => {
      this.deviceImei = deviceImei;
    });

    this.webConfigOptions.forEach((option) => {
      (this.userForm.get("webConfig") as FormGroup).addControl(
        option.value,
        this.fb.control(false)
      );
    });

    this.androidConfigOptions.forEach((option) => {
      (this.userForm.get("androidConfig") as FormGroup).addControl(
        option.value,
        this.fb.control(false)
      );
    });

    this.route.queryParams.subscribe((v) => {
      this.deviceId = v["deviceId"] || 0;
      if (this.deviceId != 0) {
        this.loadDeviceConfig();
      }
    });
  }

  loadDeviceConfig() {
    if (this.deviceImei) {
      try {

        this.firebaseService
          .getDeviceData(this.deviceImei)
          .subscribe((data) => {
            this.populateForm(data);
          });
      } catch (error) {
        console.error("Error loading device config:", error);
      }
    }
  }

  populateForm(config: any) {
    console.log("populateformcalled", config);
    if (config) {
      const webConfigGroup = this.userForm.get("webConfig") as FormGroup;
      const androidConfigGroup = this.userForm.get(
        "androidConfig"
      ) as FormGroup;

      if (config.webConfig) {
        console.log("config", config);

        Object.keys(config.webConfig).forEach((key) => {
          if (webConfigGroup.contains(key)) {
            webConfigGroup.get(key)?.setValue(config.webConfig[key]);
          }
        });
      } else {
        console.warn("webConfig is undefined or null");
      }

      if (config.androidConfig) {
        Object.keys(config.androidConfig).forEach((key) => {
          if (androidConfigGroup.contains(key)) {
            androidConfigGroup.get(key)?.setValue(config.androidConfig[key]);
          }
        });
      } else {
        console.warn("androidConfig is undefined or null");
      }
    } else {
      console.warn("Config is undefined or null");
    }
  }

  async onSubmit() {
    const webConfigValue = this.userForm.get("webConfig")?.value;
    const androidConfigValue = this.userForm.get("androidConfig")?.value;

    // Create an object to hold both configurations
    const configData = {
      webConfig: webConfigValue,
      androidConfig: androidConfigValue,
    };

    console.log("Configuration Data:", configData);

    if (this.deviceImei) {
      try {
        const result = await this.firebaseService.saveDeviceData(
          this.deviceImei,
          configData
        );
        console.log(result);
      } catch (error) {
        console.error(error);
      }
    }

    if (this.deviceId) {
      this.router.navigate(["/device", "Device updated successfully"]);
    } else {
      this.router.navigate(["/device", "Device created successfully"]);
    }
  }



  cancel() {
    window.history.back();
  }
}
