import { Component, Input } from "@angular/core";
import { InputTextModule } from "primeng/inputtext";
import { VehicleListService } from "src/app/service/vehicle-list.service";
import { DatePickerComponent } from "src/app/dashboard/commonComponents/dateComponent/presenter/date-picker/date-picker.component";
import { ToastModule } from "primeng/toast";
import { Subscription } from "rxjs";
import { CommonModule } from "@angular/common";
import { Chart } from "chart.js";
import { SocGraphRepository } from "../../domain/socGraphRepository";
import { ToastService } from "src/app/service/toast.service";
import { DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CommonUtils } from "src/app/utils/commonUtils";
@Component({
  selector: "app-soc-graph",
  standalone: true,
  imports: [
    InputTextModule,
    DatePickerComponent,
    CommonModule,
    FormsModule,
    ToastModule,
    DatePipe,
  ],
  templateUrl: "./soc-graph.component.html",
  styleUrl: "./soc-graph.component.scss",
  providers: [SocGraphRepository],
})
export class SocGraphComponent {
  @Input() vehicleid!: number;
  @Input() map!: L.Map;
  lineChart: any;
  socData!: number[];
  timestamp!: string[];
  avgSoc!: string;
  maxSoc!: number;
  minSoc!: number;
  startAddress!: string;
  endAddress!: string;
  dateComponent: boolean = false;
  dateRange: string = "";
  subscription!: Subscription;
  startDate: string = "";
  endDate: string = "";
  showData: boolean = false;
  constructor(
    private vehicleListService: VehicleListService,
    private datePipe: DatePipe,
    private socGraphRepository: SocGraphRepository,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = ("0" + (currentDate.getMonth() + 1)).slice(-2); // Adding 1 because months are zero-indexed
    const currentDay = ("0" + currentDate.getDate()).slice(-2);
    let startDate = `${currentYear}-${currentMonth}-${currentDay} 00:00:00`;
    let endDate = `${currentYear}-${currentMonth}-${currentDay} 23:59:59`;
    this.startDate = CommonUtils.addTimeZone(startDate);
    this.endDate = CommonUtils.addTimeZone(endDate);
    this.applyDateRangeRestriction();
    this.getSocReportData(this.vehicleid, this.startDate, this.endDate);
    this.subscription = this.vehicleListService.closeForm$.subscribe(
      (isOpen) => {
        this.dateComponent = isOpen;
      }
    );
    this.vehicleListService.dateRangeSelected.subscribe(
      (dates: { startDate: string; endDate: string }) => {
        this.startDate = dates.startDate;
        this.endDate = dates.endDate;

        this.getSocReportData(this.vehicleid, this.startDate, this.endDate);
      }
    );
  }
  applyDateRangeRestriction() {
    this.vehicleListService.setRestrictDateRange(true, true);
  }
  getSocReportData(vehicleid: number, startDate: string, endDate: string) {
    this.dateRange =
      this.datePipe.transform(this.startDate, "yyyy-MM-dd HH:mm:ss") +
      "  --  " +
      this.datePipe.transform(this.endDate, "yyyy-MM-dd HH:mm:ss");
    this.socGraphRepository
      .getSocReportData(vehicleid, startDate, endDate)
      .subscribe(
        (data) => {
          this.showData = true;
          const {
            socData,
            timestamp,
            averageSocValue,
            maxSocValue,
            minSocValue,
            startAddress,
            endAddress,
          } = data;
          this.timestamp = timestamp.map(
            (dateString) =>
              this.datePipe.transform(dateString, "yyyy-MM-dd HH:mm:ss") || ""
          );
          // Assigning values to class properties
          this.socData = socData;
          this.avgSoc = averageSocValue;
          this.maxSoc = maxSocValue;
          this.minSoc = minSocValue;
          this.startAddress = startAddress;
          this.endAddress = endAddress;

          this.getSocAnalysisData(this.socData, this.timestamp);
        },
        this.toastService.errorToast,
        () => {}
      );
  }
  openDateComponent() {
    this.dateComponent = true;
  }
  getSocAnalysisData(socData: number[], timestamp: string[]) {
    const canvas = document.getElementById("lineChart") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 180);
      gradient.addColorStop(0, "rgba(0, 0, 255)"); // Start color
      gradient.addColorStop(0.8, "rgba(255, 255, 255)"); // End color
      this.lineChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: socData,
          datasets: [
            {
              label: "SOC",
              data: socData,
              fill: true,
              backgroundColor: gradient,
              borderWidth: 2,
              borderColor: "blue",
              tension: 0.4,
            },
          ],
        },
        options: {
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context: any) {
                  let label = "";
                  if (context.dataset.label) {
                    label += "SOC: " + context.parsed.y.toFixed(2); // Add SOC data value
                  }
                  if (
                    context.parsed.x !== null &&
                    timestamp[context.dataIndex]
                  ) {
                    label += "\nTime: " + timestamp[context.dataIndex]; // Add timestamp value
                  }
                  return label;
                },
              },
              mode: "index", // Ensure tooltip mode is 'index' to display multiple items
            },
            legend: {
              position: "top", // Set legend position to top-left
              align: "start",

              labels: {
                boxWidth: 0,

                font: {
                  size: 9,
                  weight: "bolder",
                },
              },
            },
          },
          scales: {
            x: {
              ticks: {
                display: false, // This hides the labels on the x-axis
              },
              title: {
                display: true,
                text: "Time", // This sets the title of the x-axis
              },
              grid: {
                display: false, // This hides the vertical grid lines
              },
            },
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    } else {
      console.error("Failed to obtain 2D rendering context.");
    }
  }
}
