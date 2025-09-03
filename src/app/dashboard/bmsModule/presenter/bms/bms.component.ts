import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Chart } from "chart.js";
import { DropdownModule } from "primeng/dropdown";
import * as L from "leaflet";
import { registerables } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { BmsRepository } from "../../domain/bms.repository";
import { config } from "src/config";
import { ToastService } from "src/app/service/toast.service";
import { Device } from "src/app/models/device";
import { ButtonModule } from "primeng/button";
import {
  bmsData,
  mainData,
  OtherData,
  TemperatureData,
} from "../../domain/bmsData.model";
import { KnobModule } from "primeng/knob";
import { CommonUtils } from "src/app/utils/commonUtils";
import { vehicleListRepository } from "src/app/tracking/vehicleList/domain/vehicleList.repository";
@Component({
  selector: "app-bms",
  standalone: true,
  imports: [
    DropdownModule,
    ButtonModule,
    CommonModule,
    KnobModule,
    FormsModule,
  ],
  templateUrl: "./bms.component.html",
  styleUrls: ["./bms.component.scss"],
  providers: [BmsRepository, vehicleListRepository],
})
export class BmsComponent implements OnInit, AfterViewInit {
  @ViewChild("multiLineCellChart") multiLineCellChart!: ElementRef;
  @ViewChild("lineTempertureChart") lineTempertureChart!: ElementRef;
  @ViewChild("multiLineVsChart") multiLineVsChart!: ElementRef;
  @ViewChild("currentTempChart") currentTempChart!: ElementRef;
  private charts: { [key: string]: Chart } = {}; // Store chart instances

  private map!: L.Map;
  devices: Device[] = [];
  batteries: { id: number; batteryNo: number }[] = [];
  selectedVehicle: number | null = null;
  selectedbattery!: number;
  shail: boolean = false;
  bmsData: any = null;
  data: any = null;
  otherData!: OtherData;
  temperatureDataArray!: TemperatureData[];
  mainData!: mainData;
  otherDataArray: { key: string; value: number; imageUrl: string }[]= [];
  mainDataArray: { key: string; value: number; imageUrl: string }[] = [];
  cellVoltages: any = {};
  isAscending: boolean = true;

  refreshInterval: any;
  constructor(
    private bmsRepo: BmsRepository,
    private toastService: ToastService,
    private vehicleListRepo: vehicleListRepository
  ) {
    // Register Chart.js components
    Chart.register(...registerables);
    // Register the zoom plugin
    Chart.register(zoomPlugin);
  }

  ngOnInit(): void {
    this.getDeviceList();
  }

  ngAfterViewInit(): void {}
  createCurrentTempChart(values: number[]): void {
    const labels = values.map((_, index) => `T${index + 1}`);
    const ctx = this.currentTempChart.nativeElement.getContext("2d");
    // Find max and min values
    // Destroy the existing chart if it exists
    ctx.clearRect(0, 0, this.currentTempChart.nativeElement.width, this.currentTempChart.nativeElement.height);

    if (this.charts["currentTempChart"]) {
      this.charts["currentTempChart"].destroy();
    }
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const backgroundColors = values.map((value) => {
      if (value == maxValue) {
        return "rgb(255,61,49)"; // Red for max value
      } else if (value == minValue) {
        return "rgb(15,164,109)"; // Green for min value
      } else {
        return "rgb(255,193,61)"; // Orange for other values
      }
    });
    this.charts["currentTempChart"] = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Temperatures",
            data: values,
            backgroundColor: backgroundColors,
            borderColor: "rgba(255, 0, 0, 1)",
            borderWidth: 1,
            barPercentage: 0.6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // This ensures that the chart doesn't automatically resize

        scales: {
          x: {
            beginAtZero: true,
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  private initMap(): void {
    this.map = L.map("dashboardMap", {
      center: [20.5937, 78.9629],
      zoom: 4,
      minZoom: 4,
      maxZoom: 18,
    });
    let options: any = {
      maxZoom: 20,
      attribution: "©",
    };
    if (!config.currentMap.includes("openstreetmap")) {
      options.subdomains = ["mt0", "mt1", "mt2", "mt3"];
    }
    L.tileLayer(config.currentMap, options).addTo(this.map);
  }
  getDeviceList(): void {
    this.bmsRepo.deviceData().subscribe(
      (d) => {
        this.devices = d;
      },
      (e) => {
        this.toastService.toastMessage("error", "Message", e.error.data);
      },
      () => {}
    );
  }

  createCellChart(volValues: number[][]): void {
    const ctx = this.multiLineCellChart.nativeElement.getContext("2d");
    ctx.clearRect(0, 0, this.multiLineCellChart.nativeElement.width, this.currentTempChart.nativeElement.height);

    // Destroy the existing chart if it exists
    if (this.charts["multiLineCellChart"]) {
      this.charts["multiLineCellChart"].destroy();
    }
    // Define colors for the datasets, add more if needed up to 24
    const colors = [
      "rgba(255, 0, 0, 1)",
      "rgba(0, 0, 255, 1)",
      "rgba(0, 255, 0, 1)",
      "rgba(255, 255, 0, 1)",
      "rgba(255, 165, 0, 1)",
      "rgba(75, 0, 130, 1)",
      "rgba(255, 0, 255, 1)",
      "rgba(0, 255, 255, 1)",
      "rgba(128, 0, 128, 1)",
      "rgba(128, 128, 0, 1)",
      "rgba(0, 128, 128, 1)",
      "rgba(128, 0, 0, 1)",
      "rgba(0, 128, 0, 1)",
      "rgba(0, 0, 128, 1)",
      "rgba(128, 128, 128, 1)",
      "rgba(192, 192, 192, 1)",
      "rgba(255, 99, 132, 1)",
      "rgba(54, 162, 235, 1)",
      "rgba(75, 192, 192, 1)",
      "rgba(153, 102, 255, 1)",
      "rgba(255, 159, 64, 1)",
      "rgba(199, 199, 199, 1)",
      "rgba(83, 51, 237, 1)",
      "rgba(214, 51, 237, 1)",
    ];

    const backgroundColors = colors.map((color) => color.replace("1)", "0.3)"));

    // Create datasets dynamically, ensuring a maximum of 24 datasets
    const datasets = volValues.slice(0, 24).map((volArray, index) => ({
      label: `Cell ${index + 1}`,
      data: volArray,
      borderColor: colors[index % colors.length],
      backgroundColor: backgroundColors[index % backgroundColors.length],
      fill: false,
    }));

    this.charts["multiLineCellChart"] = new Chart(ctx, {
      type: "line",
      data: {
        labels: Array.from(
          { length: volValues[0].length },
          (_, i) => `Cell Voltages ${i + 1}`
        ),
        datasets: datasets,
      },
      options: {
        plugins: {
          zoom: {
            pan: {
              enabled: true,
              mode: "x",
            },
            zoom: {
              drag: {
                enabled: true,
              },
              mode: "x",
            },
          },
        },
        responsive: true,
        maintainAspectRatio: false, // This ensures that the chart doesn't automatically resize

        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "Cell Voltages",
            },
            ticks: {
              display: false, // Hide x-axis ticks
            },
          },
          y: {
            display: true,
          },
        },
      },
    });
  }

  createTempertureChart(tempValues: number[][]): void {
    const ctx = this.lineTempertureChart.nativeElement.getContext("2d");
    ctx.clearRect(0, 0, this.lineTempertureChart.nativeElement.width, this.currentTempChart.nativeElement.height);

    // Destroy the existing chart if it exists
    if (this.charts["lineTempertureChart"]) {
      this.charts["lineTempertureChart"].destroy();
    }
    // Define colors for the datasets
    const colors = [
      "rgba(255, 0, 0, 1)",
      "rgba(0, 0, 255, 1)",
      "rgba(0, 255, 0, 1)",
      "rgba(255, 255, 0, 1)",
      "rgba(255, 165, 0, 1)",
      "rgba(75, 0, 130, 1)",
      "rgba(255, 0, 255, 1)",
      "rgba(0, 255, 255, 1)",
      "rgba(128, 0, 128, 1)",
      "rgba(128, 128, 0, 1)",
      "rgba(0, 128, 128, 1)",
      "rgba(128, 0, 0, 1)",
    ];

    // Create datasets dynamically
    const datasets = tempValues.map((tempArray, index) => ({
      label: `Temp ${index + 1}`,
      data: tempArray,
      borderColor: colors[index % colors.length],
      fill: false,
    }));

    this.charts["lineTempertureChart"] = new Chart(ctx, {
      type: "line",
      data: {
        labels: Array.from(
          { length: tempValues[0].length },
          (_, i) => `Temperatures ${i + 1}`
        ),
        datasets: datasets,
      },
      options: {
        plugins: {
          zoom: {
            pan: {
              enabled: true,
              mode: "x",
            },
            zoom: {
              drag: {
                enabled: true,
              },
              mode: "x",
            },
          },
        },
        responsive: true,
        maintainAspectRatio: false, // This ensures that the chart doesn't automatically resize

        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "Temperature Sensors",
            },
            ticks: {
              display: false, // Hide x-axis ticks
            },
          },
          y: {
            display: true,
          },
        },
      },
    });
  }
  addCustomMarker(latlng: L.LatLng) {
    const icon = L.icon({
      iconUrl: "assets/demo/images/vehicles/rp_marker_battery_blue.png",
      iconSize: [32, 32], // adjust the size as needed
      iconAnchor: [16, 32], // point of the icon which will correspond to marker's location
    });

    L.marker(latlng, { icon }).addTo(this.map);
    this.map.flyTo(latlng, 18); // Adjust the zoom level as needed
  }

  createVsChart(vol: number[], cur: number[], soc: number[]): void {
    const ctx = this.multiLineVsChart.nativeElement.getContext("2d");
    ctx.clearRect(0, 0, this.multiLineVsChart.nativeElement.width, this.currentTempChart.nativeElement.height);

    // Destroy the existing chart if it exists
    if (this.charts["multiLineVsChart"]) {
      this.charts["multiLineVsChart"].destroy();
    }
    this.charts["multiLineVsChart"] = new Chart(ctx, {
      type: "line",
      data: {
        labels: Array.from({ length: vol.length }, (_, i) => ` ${i + 1}`),
        datasets: [
          {
            label: "Soc ",
            data: soc,
            borderColor: "rgba(255, 0, 0, 1)",
            backgroundColor: "rgba(255, 0, 0, 0.3)",
            fill: false,
          },
          {
            label: "Cur",
            data: cur,
            borderColor: "rgba(0, 0, 255, 1)",
            backgroundColor: "rgba(0, 0, 255, 0.3)",
            fill: false,
          },
          {
            label: "Vol",
            data: vol,
            borderColor: "rgba(0, 255, 0, 1)",
            backgroundColor: "rgba(0, 255, 0, 0.3)",
            fill: false,
          },
        ],
      },
      options: {
        plugins: {
          zoom: {
            pan: {
              enabled: true,
              mode: "x",
            },
            zoom: {
              drag: {
                enabled: true,
              },
              mode: "x",
            },
          },
        },
        responsive: true,
        maintainAspectRatio: false, // This ensures that the chart doesn't automatically resize

        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "Current vs Voltage vs Soc",
            },
            ticks: {
              display: false, // Hide x-axis ticks
            },
          },
          y: {
            display: true,
          },
        },
      },
    });
  }
  onDropdownChange1(event: any) {
    this.selectedVehicle = event.value;
    this.getBmsData(this.selectedVehicle);
  }
  onDropdownChange2(event: any) {
    this.selectedbattery = event.value;
    this.showBmsData();
    this.getHistoryData(this.selectedVehicle);

    this.refreshInterval = setInterval(() => {
      this.getBmsData(this.selectedVehicle);
      this.showBmsData();
      this.getHistoryData(this.selectedVehicle);
    }, 10000);
  }
  showBmsData() {
    try {
      let positionDetails = JSON.parse(this.data[this.selectedbattery - 1]);
  
      this.bmsData = {
        ...positionDetails.position.attributes.BMS,
        BMS: {
          ...positionDetails.position.attributes.BMS,
          B4: positionDetails.position.attributes.BMS.B4 / 1000,
          B6: positionDetails.position.attributes.BMS.B6 / 1000,
        },
      };

      setTimeout(() => {
        this.extractOtherData(positionDetails.position.attributes);
        this.extractMainData(positionDetails.position.attributes);
        this.generateCellVoltageArray(positionDetails);
        this.createCurrentTempChart(positionDetails.position.attributes.BMS.TM);
        if (!this.map) {
          this.initMap();
        }
        this.addCustomMarker(
          L.latLng(
            positionDetails.position.latitude,
            positionDetails.position.longitude
          )
        );
      }, 800);
    } catch (err: any) {
      this.bmsData = null;
    }
  }
  getHistoryData(selectedVehicle: number | null) {
    const currentDate = new Date();
    // currentDate.setDate(currentDate.getHistoryData

    const currentYear = currentDate.getFullYear();
    const currentMonth = ("0" + (currentDate.getMonth() + 1)).slice(-2); // Adding 1 because months are zero-indexed
    const currentDay = ("0" + currentDate.getDate()).slice(-2);
    let startDate = `${currentYear}-${currentMonth}-${currentDay} 00:00:00`;
    let endDate = `${currentYear}-${currentMonth}-${currentDay} 23:59:59`;
    startDate = CommonUtils.addTimeZone(startDate);
    endDate = CommonUtils.addTimeZone(endDate);

    this.bmsRepo
      .getCoordinatesData(selectedVehicle || 0, startDate, endDate)
      .subscribe(
        (d) => {
   
          let B1Values: number[] = [];
          let B2Values: number[] = [];
          let B3Values: number[] = [];
          let TMValues: number[][] = [];
          let CvValues: number[][] = [];
          // Iterate over each object in the JSON data
          d.forEach((obj: any) => {
            // Parse the 'details' JSON string
            const details = JSON.parse(obj.details);

            // Check if 'BMS' exists in the parsed details
            if (details.BMS) {
              // Extract B1, B2, B3 values from the 'BMS' object
              if (details.BMS.B1 !== undefined) {
                B1Values.push(details.BMS.B1);
              }
              if (details.BMS.B2 !== undefined) {
                B2Values.push(details.BMS.B2);
              }
              if (details.BMS.B3 !== undefined) {
                B3Values.push(details.BMS.B3);
              }

              // Process TM array
              if (details.BMS.TM && Array.isArray(details.BMS.TM)) {
                details.BMS.TM.forEach((value: number, index: number) => {
                  // Ensure TMValues has enough arrays
                  if (!TMValues[index]) {
                    TMValues[index] = [];
                  }
                  TMValues[index].push(value);
                });
              }

              // Process TM array
              if (details.BMS.CV && Array.isArray(details.BMS.CV)) {
                details.BMS.CV.forEach((value: number, index: number) => {
                  // Ensure TMValues has enough arrays
                  if (!CvValues[index]) {
                    CvValues[index] = [];
                  }
                  CvValues[index].push(value);
                });
              }
            }
          });

          this.createVsChart(B1Values, B2Values, B3Values);
          this.createTempertureChart(TMValues);
          this.createCellChart(CvValues);
        },
        (e) => {
          this.toastService.toastMessage(
            "error",
            "Message",
            e.error?.data.message
          );
        }
      );
  }
  sortCellVoltages() {
    if (this.isAscending) {
      this.cellVoltages.sort((a: any, b: any) => +a.value - +b.value); // Sort ascending
    } else {
      this.cellVoltages.sort((a: any, b: any) => +b.value - +a.value); // Sort descending
    }
    this.isAscending = !this.isAscending; // Toggle the flag
  }
  getBmsData(selectedVehicle: number | null) {
    this.bmsRepo.getBmsData(selectedVehicle).subscribe(
      (data) => {
        this.batteries = data.map((device: any, index: number) => ({
          id: index + 1, // Assuming device has an id property
          batteryNo: index + 1,
        }));

        this.data = data;
      },
      (error: any) => {
        this.toastService.showErrorToast("No data found");
        this.data = null;
      }
    );
  }

  extractOtherData(data: any) {
    this.otherData = {
      "Charger Status": {
        value:
          data.BMS.B12 == 0
            ? "Stationed"
            : data.BMS.B12 == 1
            ? "Charging"
            : "Discharging",
        imageUrl:
          data.BMS.B12 == 0
            ? "assets/demo/images/bmsimages/charger_null.svg"
            : data.BMS.B12 == 1
            ? "assets/demo/images/bmsimages/charger_on.svg"
            : "assets/demo/images/bmsimages/charger_off.svg",
      },
      "BMS Cycle": {
        value: data.BMS.B14,
        imageUrl: "assets/demo/images/bmsimages/bms_cycle.svg",
      },
      "Load Status": {
        value: data.BMS.B13 == 0 ? "No Load" : "Loaded",
        imageUrl: "assets/demo/images/bmsimages/load.svg",
      },
      "Temp Sensors": {
        value: data.BMS.B16,
        imageUrl: "assets/demo/images/bmsimages/temp.svg",
      },
      "No of Cells": {
        value: data.BMS.B15,
        imageUrl: "assets/demo/images/bmsimages/no_of_cells.svg",
      },
      Kms_driven: {
        value: data.totalDistance.toFixed(2).toString() + " Kms",
        imageUrl: "assets/demo/images/bmsimages/odometer.svg",
      },
    };

    // Assuming transformOtherDataToArray is defined elsewhere
    this.otherDataArray = this.transformOtherDataToArray(this.otherData);

}

  transformOtherDataToArray(
    otherData: OtherData
  ): { key: string; value: number; imageUrl: string }[] {
    return Object.entries(otherData).map(([key, { value, imageUrl }]) => ({
      key,
      value,
      imageUrl,
    }));
  }
  

  generateCellVoltageArray(bmsData: any) {
    this.cellVoltages = bmsData.position.attributes.BMS.CV.map(
      (value: string, index: number) => {
        return { key: `Cell ${index + 1}`, value: (+value / 1000).toFixed(3) }; // Convert string to number and divide by 1000
      }
    );

  }

  extractMainData(data: any) {
    this.mainData = {
      Voltage: {
        value: data.BMS.B1.toString() + " V",
        imageUrl: "assets/demo/images/bmsimages/voltage.svg",
      },
      Current: {
        value: data.BMS.B2.toString() + " Amp",
        imageUrl: "assets/demo/images/bmsimages/current.svg",
      },
      SOC: {
        value: data.BMS.B3.toString() + " %",
        imageUrl: "assets/demo/images/bmsimages/soc.png",
      },
      "Residual Capacity": {
        value: data.BMS.B11.toString() + " Ah",
        imageUrl: "assets/demo/images/bmsimages/residual.svg",
      },
      "Kwh Charging": {
        value: data.BMS.B17,
        imageUrl: "assets/demo/images/bmsimages/kwh_charging.svg",
      },
      "Kwh Discharging": {
        value: data.BMS.B18,
        imageUrl: "assets/demo/images/bmsimages/kwh_discharging.svg",
      },
    };
    this.mainDataArray = this.transformMainDataToArray(this.mainData);

  }
  transformMainDataToArray(
    mainData: mainData
  ): { key: string; value: number; imageUrl: string }[] {
    return Object.entries(mainData).map(([key, { value, imageUrl }]) => ({
      key,
      value,
      imageUrl,
    }));
  }
  

  scrollLeft() {
    const container = document.querySelector(".scroll-container");
    if (container) {
      container.scrollBy({
        left: -100,
        behavior: "smooth",
      });
    }
  }

  scrollRight() {
    const container = document.querySelector(".scroll-container");
    if (container) {
      container.scrollBy({
        left: 100,
        behavior: "smooth",
      });
    }
  }
  resetZoom(): void {
    for (const chartKey in this.charts) {
      if (this.charts[chartKey]) {
        this.charts[chartKey].resetZoom();
      }
    }
  }
  ngOnDestroy() {
    clearInterval(this.refreshInterval);
  }
}
