import { Component, OnInit, ViewChild } from "@angular/core";
import { Table, TableModule } from "primeng/table";
import { CommonModule } from "@angular/common";
import { ToastModule } from "primeng/toast";
import { RippleModule } from "primeng/ripple";
import { ConfigService } from "src/app/service/config.service";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { MultiSelectModule } from "primeng/multiselect";
import "jspdf-autotable"; // Import jspdf-autotable
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { SkeletonModule } from "primeng/skeleton";
import { ConfirmationService } from "primeng/api";
import { InputTextModule } from "primeng/inputtext";
import { DropdownModule } from "primeng/dropdown";
import { ButtonModule } from "primeng/button";
import { DeviceService } from "src/app/service/device.service";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { DatePickerComponent } from "src/app/dashboard/commonComponents/dateComponent/presenter/date-picker/date-picker.component";
import { Subscription } from "rxjs";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { VehicleListService } from "src/app/service/vehicle-list.service";
import { DistanceReport } from "../../domain/distanceReport.model";
import { StopReport } from "src/app/dashboard/report/domain/stopReport.model";
import { IdleReport } from "src/app/dashboard/report/domain/idleReport.model";
import { TripReport } from "src/app/dashboard/report/domain/tripReport.model";
import { DatePipe } from "@angular/common";
import { OverSpeedReport } from "src/app/dashboard/report/domain/overSpeedReport.model";
import { ReportRepository } from "../../domain/report.repository";
import { ToastService } from "src/app/service/toast.service";
import { SocReport } from "../../domain/socReport.model";
import { TempReport } from "../../domain/tempReport.model";
import { DetailReport } from "../../domain/detailReport.model";
import { GeocodingService } from "src/app/service/geocoding.service";
import { config } from "src/config";
import { ReportService } from "../../domain/report.service";
@Component({
  selector: "app-reports",
  standalone: true,
  imports: [
    TableModule,
    ProgressSpinnerModule,
    ConfirmDialogModule,
    SkeletonModule,
    DatePipe,
    RippleModule,
    DatePickerComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    MultiSelectModule,
  ],
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.scss"],
  providers: [DatePipe, ConfirmationService, ReportRepository],
})
export class ReportsComponent implements OnInit {
  devices: any[] = [];
  @ViewChild("dt") dt!: Table; // Reference to the p-table component

  distanceReport: DistanceReport[] = [];
  stopReport: StopReport[] = [];
  idleReport: IdleReport[] = [];
  tripReport: TripReport[] = [];
  overspeedReport: OverSpeedReport[] = [];
  temperatureReport: TempReport[] = [];
  totalDistanceReport: any = [];
  acReport: any[] = [];
  socReport: SocReport[] = [];
  detailReport: DetailReport[] = [];
  startDate: string = "";
  endDate: string = "";
  overSpeedLimit!: number;
  timeSpan!: number;
  fullDisplay: boolean = false;
  distanceReportLoading: boolean = false;
  idleReportLoading: boolean = false;
  socReportLoading: boolean = false;
  stopReportLoading: boolean = false;
  reportdownloading: boolean = false;
  overSpeedReportLoading: boolean = false;
  temperatureReportLoading: boolean = false;
  acReportLoading: boolean = false;
  detailReportLoading: boolean = false;
  totalDistanceReportLoading: boolean = false;
  selectedVehicleName: string = "";
  tripReportLoading: boolean = false;
  selectedReport: string = "DR";
  searchingReportName!: string;
  selectedVehicle: number[] = [];
  selectedReportName: string = "Distance Report";
  dateComponent: boolean = false;
  private subscription!: Subscription;
  deviceSelected: boolean = false;
  totalDistance: number = 0;
  dateRange: string = "";
  data!: any[];
  selectedReportArray!: any;
  //   pdf = new jsPDF('p', 'mm', 'a4');
  reports: any[] = [
    { name: "Distance Report", code: "DR" },
    { name: "Trip Report", code: "TR" },
    { name: "Stop Report", code: "SR" },
    { name: "Idle Report", code: "IR" },
    { name: "Over Speed Report", code: "OS" },
    { name: "Soc Report", code: "SOC" },
    { name: "Temperature Report", code: "TEMP" },
    { name: "Detail Report", code: "DETAIL" },
    { name: "Total Distance Report", code: "TDS" },
    { name: "Ac Report(coming soon)", code: "AC" },
  ];

  constructor(
    public deviceService: DeviceService,
    private vehicleListRepo: VehicleListService,
    private geoCoder: GeocodingService,
    private datePipe: DatePipe,
    private reportRepo: ReportRepository,
    private toastService: ToastService,
    private configService: ConfigService,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.applyDateRangeRestriction();
    this.getDeviceList();
    this.subscription = this.vehicleListRepo.closeForm$.subscribe((isOpen) => {
      this.dateComponent = isOpen;
    });
    this.vehicleListRepo.dateRangeSelected.subscribe(
      (dates: { startDate: string; endDate: string }) => {
        this.dateRange =
          this.datePipe.transform(dates.startDate, "yyyy-MM-dd HH:mm:ss") +
          "  --  " +
          this.datePipe.transform(dates.endDate, "yyyy-MM-dd HH:mm:ss");
        this.startDate = dates.startDate;
        this.endDate = dates.endDate;
      }
    );
    this.configService.setConfigSubject$.subscribe((data) => {
      if (data) {
        console.log(config.configJson.webConfig.reports);
        this.selectedReportArray = config.configJson.webConfig.reports;
        this.filterReport();
      }
    });
  }
  filterReport() {
    this.reports = this.reports.filter((report) => {
      switch (report.code) {
        case "DR":
          return this.selectedReportArray.distanceReport;
        case "TR":
          return this.selectedReportArray.tripReport;
        case "SR":
          return this.selectedReportArray.stopReport;
        case "IR":
          return this.selectedReportArray.idleReport;
        case "OS":
          return this.selectedReportArray.overspeedReport;
        case "SOC":
          return this.selectedReportArray.socReport;
        case "TEMP":
          return this.selectedReportArray.temperatureReport;
        case "DETAIL":
          return this.selectedReportArray.detailReport;
        case "AC":
          return this.selectedReportArray.acReport;
        case "TDS":
          return this.selectedReportArray.totalDistanceReport;
        default:
          return false;
      }
    });
  }
  applyDateRangeRestriction() {
    this.vehicleListRepo.setRestrictDateRange(false, false);
  }
  openDateComponent() {
    this.dateComponent = true;
  }

  getDeviceList(): void {
    this.reportRepo.getDeviceData().subscribe(
      (d) => {
        this.devices = d;
      },
      this.toastService.errorToast,
      () => {}
    );
  }

  onDropdownChange(event: any) {
    this.clearReports();

    (this.selectedReport = event.value.code),
      (this.selectedReportName = event.value.name);
  }
  clearReports() {
    this.distanceReport = [];
    this.tripReport = [];
    this.stopReport = [];
    this.idleReport = [];
    this.overspeedReport = [];
    this.socReport = [];
    this.temperatureReport = [];
    this.acReport = [];
    this.detailReport = [];
    this.totalDistanceReport = [];
  }
  onDropdownChange1(event: any) {
    if(this.selectedReport!=="TDS"){
      this.selectedVehicle=[]
    }
    this.deviceSelected = !!event.value;
    this.selectedVehicle.push(event.value.code);
    this.selectedVehicleName = event.value.name;
  }

  isDataAvailable(): boolean {
    // Check if there is any data available in the table
    // You can modify this condition based on how you determine if data is available
    return (
      this.distanceReport.length === 0 &&
      this.stopReport.length === 0 &&
      this.idleReport.length === 0 &&
      this.tripReport.length === 0 &&
      this.overspeedReport.length === 0 &&
      this.socReport.length === 0 &&
      this.temperatureReport.length === 0 &&
      this.detailReport.length === 0 &&
      this.totalDistanceReport.length === 0
    );
  }
  hasProperty(property: string): boolean {
    return this.detailReport.some((report) => report.hasOwnProperty(property));
  }

  getReport(reportName: string) {
    this.clearReports();
    switch (reportName) {
      case "Distance Report":
        this.loadDistanceReport();
        break;
      case "Trip Report":
        this.loadTripReport();
        break;
      case "Stop Report":
        this.loadStopReport();
        break;
      case "Idle Report":
        this.loadIdleReport();
        break;
      case "Over Speed Report":
        this.loadOverSpeedReport();
        break;
      case "Soc Report":
        this.loadSocReport();
        break;
      case "Temperature Report":
        this.loadTemperatureReport();
        break;
      case "Detail Report":
        this.loadDetailReport();
        break;
      case "Total Distance Report":
        this.loadTotalDistance();
        break;
    }
  }

  loadTotalDistance() {
    this.totalDistanceReportLoading = true;
    this.reportRepo
      .getMultipleVehicleDistanceData(
        this.selectedVehicle,
        this.startDate,
        this.endDate
      )
      .subscribe(
        (data) => {
          this.totalDistanceReport = data;
          this.data = data;

          this.totalDistanceReportLoading = false;
        },
        (e) => {
          this.toastService.toastMessage("error", "Message", e);
          this.totalDistanceReportLoading = false;
        },
        () => (this.totalDistanceReportLoading = false)
      );

  }

  loadDistanceReport() {
    this.distanceReportLoading = true;
    this.reportRepo
      .getDistanceReportData(
        this.selectedVehicle[0],
        this.startDate,
        this.endDate,
        "distanceReport"
      )
      .subscribe(
        (data) => {
          this.handleReportData(data.distanceReport, "distanceReport");
          this.totalDistance = data.totalDistance;
          this.data = data.distanceReport;
        },
        (e) => {
          this.toastService.toastMessage("error", "Message", e);
          this.distanceReportLoading = false;
        },
        () => (this.distanceReportLoading = false)
      );
  }

  loadTripReport() {
    console.log(this.selectedVehicle[0], this.startDate, this.endDate);
    this.tripReportLoading = true;
    this.reportRepo
      .getTripReportData(
        this.selectedVehicle[0],
        this.startDate,
        this.endDate,
        "tripReport"
      )
      .subscribe(
        (data) => {
          this.handleReportData(data, "tripReport");
          this.data = data;
        },
        (e) => {
          this.toastService.toastMessage("error", "Message", e);
          this.tripReportLoading = false;
        },
        () => (this.tripReportLoading = false)
      );
  }

  loadStopReport() {
    this.stopReportLoading = true;
    this.reportRepo
      .getStopReportData(
        this.selectedVehicle[0],
        this.startDate,
        this.endDate,
        "stopReport"
      )
      .subscribe(
        (data) => {
          this.handleReportData(data, "stopReport");
          this.data = data;
        },
        (e) => {
          this.toastService.toastMessage("error", "Message", e);
          this.stopReportLoading = false;
        },
        () => (this.stopReportLoading = false)
      );
  }

  loadIdleReport() {
    this.idleReportLoading = true;
    this.reportRepo
      .getIdleReportData(
        this.selectedVehicle[0],
        this.startDate,
        this.endDate,
        "idleReport"
      )
      .subscribe(
        (data) => {
          this.handleReportData(data, "idleReport");
          this.data = data;
        },
        (e) => {
          this.toastService.toastMessage("error", "Message", e);
          this.idleReportLoading = false;
        },
        () => (this.idleReportLoading = false)
      );
  }

  loadOverSpeedReport() {
    this.overSpeedReportLoading = true;
    this.reportRepo
      .getOverSpeedReportData(
        this.selectedVehicle[0],
        this.startDate,
        this.endDate,
        "overSpeedReport",
        this.overSpeedLimit
      )
      .subscribe(
        (data) => {
          this.handleReportData(data, "overspeedReport");
          this.data = data;
        },
        (e) => {
          this.toastService.toastMessage("error", "Message", e);
          this.overSpeedReportLoading = false;
        },
        () => (this.overSpeedReportLoading = false)
      );
  }

  loadSocReport() {
    this.socReportLoading = true;
    this.reportRepo
      .getSocReportData(this.selectedVehicle[0], this.startDate, this.endDate)
      .subscribe(
        (data) => {
          this.handleReportData(data, "socReport");
          this.data = data;
        },
        (e) => {
          this.toastService.toastMessage("error", "Message", e);
          this.socReportLoading = false;
        },
        () => (this.socReportLoading = false)
      );
  }

  loadTemperatureReport() {
    this.temperatureReportLoading = true;
    this.reportRepo
      .getTempReportData(this.selectedVehicle[0], this.startDate, this.endDate)
      .subscribe(
        (data) => {
          this.handleReportData(data, "temperatureReport");
          this.data = data;
        },
        (e) => {
          this.toastService.toastMessage("error", "Message", e);
          this.temperatureReportLoading = false;
        },
        () => (this.temperatureReportLoading = false)
      );
  }

  loadDetailReport() {
    this.detailReportLoading = true;
    this.reportRepo
      .getDetailReportData(
        this.selectedVehicle[0],
        this.startDate,
        this.endDate,
        this.timeSpan
      )
      .subscribe(
        (data) => {
          this.handleReportData(data, "detailReport");
          this.data = data;
        },
        (e) => {
          this.toastService.toastMessage("error", "Message", e);
          this.detailReportLoading = false;
        },
        () => (this.detailReportLoading = false)
      );
  }
  handleReportData(data: any, reportType: keyof ReportsComponent) {
    (this as any)[reportType] = data;

    setTimeout(() => {
      this.loadAddressesForCurrentPage(reportType);
    }, 1000);
  }

  // handleError(error: any, loadingFlag: keyof ReportsComponent) {
  //   this.toastService.errorToast(error);
  //   (this as any)[loadingFlag] = false;
  // }

  loadAddressesForCurrentPage(reportType: keyof ReportsComponent) {
    this.searchingReportName = reportType;
    const startPoint = this.dt.first ?? 0;
    const endPoint = (this.dt.first ?? 0) + (this.dt.rows ?? 10);
    for (let i = startPoint; i < endPoint; i++) {
      switch (reportType) {
        case "distanceReport":
          this.geoCoder
            .getLocation(this.dt._value[i].startLat, this.dt._value[i].startLng)
            .then((address) => {
              this.dt._value[i].startAddress = address;
            });
          this.geoCoder
            .getLocation(this.dt._value[i].endLat, this.dt._value[i].endLng)
            .then((address) => {
              this.dt._value[i].endAddress = address;
            });
          break;
        case "tripReport":
          this.geoCoder
            .getLocation(this.dt._value[i].startLat, this.dt._value[i].startLng)
            .then((address) => {
              this.dt._value[i].startAddress = address;
            });
          this.geoCoder
            .getLocation(this.dt._value[i].endLat, this.dt._value[i].endLng)
            .then((address) => {
              this.dt._value[i].endAddress = address;
            });
          break;
        case "stopReport":
          this.geoCoder
            .getLocation(
              this.dt._value[i].latitude,
              this.dt._value[i].longitude
            )
            .then((address) => {
              this.dt._value[i].address = address;
            });
          break;
        case "idleReport":
          this.geoCoder
            .getLocation(
              this.dt._value[i].latitude,
              this.dt._value[i].longitude
            )
            .then((address) => {
              this.dt._value[i].address = address;
            });
          break;
        case "overspeedReport":
          this.geoCoder
            .getLocation(this.dt._value[i].startLat, this.dt._value[i].startLng)
            .then((address) => {
              this.dt._value[i].startAddress = address;
            });
          this.geoCoder
            .getLocation(this.dt._value[i].endLat, this.dt._value[i].endLng)
            .then((address) => {
              this.dt._value[i].endAddress = address;
            });
          break;

        case "detailReport":
          this.geoCoder
            .getLocation(
              this.dt._value[i].latlng.lat,
              this.dt._value[i].latlng.lng
            )
            .then((address) => {
              this.dt._value[i].address = address;
            });
          break;
      }
    }
  }

  onPageChange(event: any) {
    this.loadAddressesForCurrentPage(
      this.searchingReportName as keyof ReportsComponent
    );
  }

  openMap(lat: number, lng: number) {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, "_blank"); // Open in a new tab/window
  }

  onDropDownGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, "contains");
  }
  toggleArrow() {
    this.fullDisplay = !this.fullDisplay; // Toggle the boolean value
  }

  async exportToPdf(name: string) {
    console.log(name);
    console.log("getting called");
    this.reportdownloading = true;
    const doc = new jsPDF();
    const headers =
      name === "Detail Report"
        ? this.getHeaders(name, {
            ac: this.detailReport[0].ac,
            door: this.detailReport[0].door,
            extVolt: this.detailReport[0].extVolt,
          })
        : this.getHeaders(name);
    await this.fetchAddresses(name);

    const headerTitle = this.selectedReportName;
    const startTime = this.datePipe.transform(this.startDate, "dd-MM-yyyy");
    const endDate = this.datePipe.transform(this.endDate, "dd-MM-yyyy");
    const vehicleNo = this.selectedVehicleName;
    const additionalInfo = this.getAdditionalInfo(name);

    doc.setFontSize(14);
    doc.text(headerTitle, 10, 10);
    doc.setFontSize(12);
    doc.text(`Vehicle number: ${vehicleNo}`, 10, 20);
    doc.text(`Start Time: ${startTime}`, 10, 30);
    doc.text(`End Time: ${endDate}`, 10, 40);
    if (additionalInfo) {
      doc.text(additionalInfo, 10, 50);
    }

    (doc as any).autoTable({
      startY: additionalInfo ? 60 : 50,
      head: [headers.map((h) => h.header)],
      body: this.data.map((row) =>
        headers.map(({ field }) => {
          if (field === "latlng") {
            return `${row.latlng.lat}, ${row.latlng.lng}`;
          } else if (field === "distance") {
            return row.distance !== null && row.distance !== undefined
              ? `${row.distance}`
              : "0";
          } else {
            return row[field];
          }
        })
      ),
    });

    doc.save("table.pdf");
    this.reportdownloading = false;
  }

  async exportToExcel(name: string) {
    const headers =
      name === "Detail Report"
        ? this.getHeaders(name, {
            ac: this.detailReport[0].ac,
            door: this.detailReport[0].door,
            extVolt: this.detailReport[0].extVolt,
          })
        : this.getHeaders(name);
    await this.fetchAddresses(name);

    const wsData = [headers.map((h) => h.header)];
    this.data.forEach((row) => {
      const rowData = headers.map(({ field }) =>
        field === "latlng" ? `${row.latlng.lat}, ${row.latlng.lng}` : row[field]
      );
      wsData.push(rowData);
    });

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(wsData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "report.xlsx");
  }

  getHeaders(
    name: string,
    options: {
      ac?: boolean;
      door?: boolean;
      extVolt?: number | undefined | null;
    } = {}
  ): { header: string; field: string }[] {
    const headerMap: { [key: string]: { header: string; field: string }[] } = {
      "Distance Report": [
        { header: "Date", field: "dateDis" },
        { header: "Distance (km)", field: "distance" },
        { header: "Start Address", field: "startAddress" },
        { header: "End Address", field: "endAddress" },
      ],
      "Trip Report": [
        { header: "Trip Start Time", field: "tripStartTime" },
        { header: "Start Address", field: "startAddress" },
        { header: "Trip End Time", field: "tripEndTime" },
        { header: "End Address", field: "endAddress" },
        { header: "Distance (km)", field: "distance" },
        { header: "Duration (min)", field: "duration" },
      ],
      "Stop Report": [
        { header: "Dormant Start", field: "dormantStart" },
        { header: "Dormant End", field: "dormantEnd" },
        { header: "Duration (min)", field: "duration" },
        { header: "Address", field: "address" },
      ],
      "Idle Report": [
        { header: "Dormant Start", field: "dormantStart" },
        { header: "Dormant End", field: "dormantEnd" },
        { header: "Duration (min)", field: "duration" },
        { header: "Address", field: "address" },
      ],
      "Over Speed Report": [
        { header: "Speed Start Time", field: "speedStartTime" },
        { header: "Start Address", field: "startAddress" },
        { header: "Speed End Time", field: "speedEndTime" },
        { header: "End Address", field: "endAddress" },
        { header: "Start Speed (km/h)", field: "startSpeed" },
        { header: "End Speed (km/h)", field: "endSpeed" },
        { header: "Distance (km)", field: "distance" },
        { header: "Duration (min)", field: "duration" },
      ],
      "Soc Report": [
        { header: "BMS SOC (%)", field: "bmsSOC" },
        { header: "Timestamp", field: "timestamp" },
        { header: "Latitude, Longitude", field: "latlng" },
      ],
      "Temperature Report": [
        { header: "Temperature (°C)", field: "temp" },
        { header: "Timestamp", field: "timestamp" },
        { header: "Latitude, Longitude", field: "latlng" },
      ],
      "Detail Report": [
        { header: "Timestamp", field: "timestamp" },
        { header: "Ignition Status", field: "ignstatus" },
        { header: "Speed (km/h)", field: "speed" },
        { header: "Latitude, Longitude", field: "latlng" },
        { header: "Address", field: "address" },
      ],
      "Ac Report": [
        { header: "Vehicle No", field: "vehicleNo" },
        { header: "Date", field: "date" },
        { header: "Distance (km)", field: "distance" },
      ],
      "Total Distance Report": [
        { header: "Vehicle Number", field: "vehicleNo" },
        { header: "Start Time", field: "firstDate" },
        { header: "End Time ", field: "lastDate" },
        { header: "Total Distance (km)", field: "totalDistance" },
      ],
    };
    let headers = headerMap[name] || [];

    if (name === "Detail Report") {
      console.log(options.ac, options.door);
      if (options.ac !== undefined && options.ac !== null) {
        headers.push({ header: "AC Status", field: "ac" });
      }
      if (options.door !== undefined && options.door !== null) {
        headers.push({ header: "Door Status", field: "door" });
      }
      if (options.extVolt !== undefined && options.extVolt !== null) {
        headers.push({ header: "External Voltage (V)", field: "extVolt" });
      }
    }
    return headers;
  }
  getAdditionalInfo(name: string): string {
    switch (name) {
      case "Distance Report":
        return `Total Distance: ${this.totalDistance} km`;
      case "Over Speed Report":
        return `Over Speed Limit: ${this.overSpeedLimit} km/h`;
      case "Detail Report":
        return `Time Span: ${this.timeSpan} min`;
      default:
        return "";
    }
  }

  async fetchAddresses(name: string) {
    for (let i = 0; i < this.data.length; i++) {
      const entry = this.data[i];

      if (
        ["Over Speed Report", "Trip Report", "Distance Report"].includes(name)
      ) {
        entry.startAddress = await this.getAddress(
          entry.startLat,
          entry.startLng,
          i,
          "start"
        );
        entry.endAddress = await this.getAddress(
          entry.endLat,
          entry.endLng,
          i,
          "end"
        );
      } else if (["Stop Report", "Idle Report"].includes(name)) {
        entry.address = await this.getAddress(
          entry.latitude,
          entry.longitude,
          i
        );
      } else if (["Detail Report"].includes(name)) {
        entry.address = await this.getAddress(
          entry.latlng.lat,
          entry.latlng.lng,
          i
        );
      } else {
      }
    }
  }

  async getAddress(
    lat: number,
    lng: number,
    index: number,
    type = "start"
  ): Promise<string> {
    if (lat && lng) {
      return await this.geoCoder
        .getLocation(lat, lng)
        .then((address) => address)
        .catch((error) => {
          console.error(
            `Error fetching ${type} address for entry ${index}:`,
            error
          );
          return "Address not available";
        });
    }
    return "Address not available";
  }

  onInput(event: any): void {
    const input = event.target;
    const value = input.value;
    input.value = value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
  }
}
