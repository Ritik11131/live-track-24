import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  HostListener,
} from "@angular/core";
import { Subject, Subscription, debounceTime, interval } from "rxjs";
import { LayoutService } from "src/app/layout/service/app.layout.service";
import * as L from "leaflet";
import "leaflet.markercluster";
import { Chart, ChartOptions, ChartConfiguration } from "chart.js";
import { takeUntil } from "rxjs/operators";
import { ToastService } from "src/app/service/toast.service";
import { Table } from "primeng/table";
import { dashboardRepository } from "../../domain/dashboard.repository";
import { MessageService } from "primeng/api";
import { Notification } from "src/app/dashboard/notifications/domain/notification.model";
import { MapData } from "src/app/helper-map";
import { VehicleTypeFactory } from "src/app/vehicleicons/VehicleFactory";
import { DatePipe } from "@angular/common";
import { VehicleBuilder } from "src/app/vehicleicons/VehicleBuilder";
import { CommonUtils } from "src/app/utils/commonUtils";
import { ActivatedRoute, Router, NavigationStart } from "@angular/router";
import { config } from "../../../../../config";
import { NotificationData } from "../../domain/notificationdata.model";
import { NotificationAlert } from "src/app/service/notificationAlert.sevice";
import { VehicleStatusData } from "../../../../models/vehicleStatusData";

interface City {
  name: string;
  code: string;
}

@Component({
  templateUrl: "./saas.dashboard.component.html",
  styleUrl: "./saas.dashboard.component.css",
  providers: [DatePipe, dashboardRepository],
})
export class SaaSDashboardComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  notificationChart!: Chart<"pie", number[], string>;
  vehicleChartValue!: Chart<"doughnut", number[], string>;
  destroy$: Subject<void> = new Subject<void>();
  lineChart: any;
  layout: number = 0;
  notificationCount!: number;
  data: MapData[] = [];
  fileredVehicles: MapData[] = [];

  categories: { [key: string]: number } = {};
  private map!: L.Map;
  statusData!: VehicleStatusData;
  private intervalSubscription!: Subscription;

  categoryValues: number[] = [];
  private clusterGroup!: any;
  notifications: Notification[] = [];
  notificationChartKeys: string[] = [];
  notificationChartValues: number[] = [];
  notificationChartBgColor: string[] = [
    "#FFB429",
    "#FF2D38",
    "#389D44",
    "#2828FF",
    "#959595",
    "#1ABC9C",
    "#5DADE2",
    "#FFEE58",
  ];
  notificationChartHoverColor: string[] = [
    "#FFD382",
    "#FF8389",
    "#90C896",
    "#8888FF",
    "#C6C6C6",
    "#48C9B0",
    "#85C1E9",
    "#FFF176",
  ];

  notificationChartData!: any;
  subscription: Subscription;

  constructor(
    public layoutService: LayoutService,
    private messageService: MessageService,
    private dashboardRepo: dashboardRepository,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationAlert: NotificationAlert
  ) {
    this.subscription = this.layoutService.configUpdate$
      .pipe(debounceTime(25))
      .subscribe(() => {});
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, "contains");
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

  getColorArray(dataArray: number[]) {
    return dataArray.slice(1).map((currentValue, i) => {
      const prevValue = dataArray[i];
      if (currentValue > prevValue) return "rgba(0, 255, 0, 0.2)";
      if (currentValue < prevValue) return "rgba(255, 0, 0, 0.2)";
      return "rgba(0, 0, 0, 0)";
    });
  }

  ngOnInit() {
    this.layout = config.layout;

    if (this.layout === 1) {
      this.intervalSubscription = interval(60000)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.getNotification();
          this.getLastPoint();
        });

      this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.destroy$.next();
          this.destroy$.complete();
        }
      });
      this.getNotification();
    }
    this.getLastPoint();
    this.initMap();
    this.initMarkerCluster();
  }

  ngAfterViewInit(): void {
    if (this.layout === 1) {
      this.showDistanceTravelled();
    }
  }

  createNotificationChart(types: string[], values: number[]): void {
    const chartCanvas = document.getElementById(
      "notificationCanvas"
    ) as HTMLCanvasElement;
    const ctx = chartCanvas.getContext("2d");

    if (this.notificationCount === 0) {
      if (ctx) {
        this.notificationChart = new Chart(ctx, {
          type: "pie",
          data: {
            labels: ["No Notifications"],
            datasets: [
              {
                label: "# of Votes",
                data: [1],
                backgroundColor: ["#A8A8A8"],
                hoverBackgroundColor: ["#B3B3B3"],
                borderColor: "transparent",
                borderWidth: 2,
              },
            ],
          },
          options: {
            plugins: {
              legend: {
                display: false,
              },
            },
          },
        });
      }
    } else {
      if (this.notificationChart) {
        this.notificationChart.data.labels = types;
        this.notificationChart.data.datasets[0].data = values;
        this.notificationChart.update();
      } else if (ctx) {
        this.notificationChart = new Chart(ctx, {
          type: "pie",
          data: {
            labels: types,
            datasets: [
              {
                label: "# of Votes",
                data: values,
                backgroundColor: this.notificationChartBgColor,
                hoverBackgroundColor: this.notificationChartHoverColor,
                borderColor: "transparent",
                borderWidth: 2,
              },
            ],
          },
          options: {
            plugins: {
              legend: {
                display: false,
              },
            },
          },
        });
      }
    }
  }

  createVehicleChart(data: number[]): void {
    if (this.vehicleChartValue) {
      this.vehicleChartValue.data.datasets[0].data = data;
      this.vehicleChartValue.update();
      return;
    }
    const chartCanvas = document.getElementById(
      "vehicleCanvas"
    ) as HTMLCanvasElement;
    const ctx = chartCanvas.getContext("2d");
    if (ctx) {
      this.vehicleChartValue = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Running", "Offline", "Idle", "Stop", "Never Connected"],
          datasets: [
            {
              label: "# of Votes",
              data: data,
              backgroundColor: [
                "#0fa46d",
                "#17628C",
                "#ffc13d",
                "#ff3d31",
                "#8D8E8E",
              ],
              hoverBackgroundColor: [
                "#32CC6B",
                "#3DC9E6",
                "#FFCD65",
                "#FF6657",
                "#B3B3B3",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          cutout: "50%",
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });
    }
  }

  showDistanceTravelled() {
    const canvas = document.getElementById("lineChart") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 180);
      gradient.addColorStop(0, "rgba(0, 0, 255)");
      gradient.addColorStop(0.8, "rgba(255, 255, 255)");
      this.lineChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: Array.from({ length: 24 }, (_, i) => i + 1),
          datasets: [
            {
              label: "Total kms",
              data: [
                35, 48, 49, 25, 21, 47, 22, 98, 15, 42, 55, 37, 38, 38, 22, 69,
                1, 44, 26, 9, 57, 42, 28, 60,
              ],
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
            legend: {
              position: "top",
              align: "start",
              labels: {
                boxWidth: 0,
                font: {
                  size: 14,
                  weight: "bolder",
                },
              },
            },
          },
          scales: {
            x: {
              ticks: {
                autoSkip: true,
                maxRotation: 0,
                minRotation: 0,
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

  getNotification() {
    this.dashboardRepo.getNoficationData().subscribe(
      (notificationChartData: NotificationData) => {
        console.log(notificationChartData);

        // Assuming config.criticalNotifications is defined and contains the keys
        const criticalNotifications: (keyof NotificationData)[] =
          config.criticalNotifications;

        // Filter notificationChartData to only include critical notifications
        this.notificationChartData = Object.keys(notificationChartData)
          .filter((key) =>
            criticalNotifications.includes(key as keyof NotificationData)
          )
          .reduce((obj: Partial<NotificationData>, key) => {
            obj[key as keyof NotificationData] =
              notificationChartData[key as keyof NotificationData];
            return obj;
          }, {});
        this.notificationChartKeys = Object.keys(this.notificationChartData);

        this.notificationChartValues = Object.values(
          this.notificationChartData
        );
        this.notificationCount = this.notificationChartValues.reduce(
          (acc, curr) => acc + curr,
          0
        );
        this.notificationAlert.notificationCountfn();
        this.createNotificationChart(
          this.notificationChartKeys,
          this.notificationChartValues
        );
      },
      (e) => {
        this.toastService.toastMessage("error", "Message", e.error.data);
        this.notificationCount = 0;
      }
    );
  }

  getLastPoint(): void {
    this.dashboardRepo.getVehicleData().subscribe(
      (data) => {
        const details = data;
        this.categories = details["summary"].reduce((acc: any, item: any) => {
          acc[item.description] = item.count;
          return acc;
        }, {});
        this.categoryValues = Object.values(this.categories);
        if (this.layout === 1) {
          this.createVehicleChart(this.categoryValues.slice(1));
        }
        this.data = details["details"];
        this.fileredVehicles = this.data;
        console.log(this.data);
        this.statusData = this.groupVehiclesByStatus(this.data);
        this.createMarkerCluster(this.data);
      },
      (e) => {
        this.toastService.toastMessage("error", "Message", e.error.data);
      }
    );
  }

  showOnMap(row: any): void {
    this.router.navigate([`/tracking/details`], {
      queryParams: { deviceId: row.device.id },
    });
  }

  private initMarkerCluster(): void {
    this.clusterGroup = L.markerClusterGroup();
    this.map.addLayer(this.clusterGroup);
  }

  customIcon(
    vehicleType: number | undefined,
    status: String,
    subStatus: String
  ) {
    const vType = VehicleTypeFactory.getInstance(vehicleType);
    const image = new VehicleBuilder().getStatusSubStatus(
      vType,
      status,
      subStatus
    );
    return "assets/demo/images/vehicles/" + image + ".png";
  }

  createMarkerCluster(points: any[]): void {
    this.clearMarkerCluster();
    points.forEach((value) => {
      if (value.position.details.vStatus) {
        const marker = L.marker(value.position.position, {
          icon: L.icon({
            iconUrl: this.customIcon(
              value.device.vehicleType,
              value.position.status.status,
              value.position.details.vStatus
            ),
            iconSize: [20, 30],
            iconAnchor: [10, 15],
            popupAnchor: [0, -32],
          }),
        });
        this.clusterGroup.addLayer(marker);
      }
    });
  }

  get colorScheme(): string {
    return this.layoutService.config().colorScheme;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  clearMarkerCluster(): void {
    this.clusterGroup.clearLayers();
  }
  groupVehiclesByStatus(vehicles: any[]): VehicleStatusData {
    this.statusData = {
      All: [...vehicles],
      Running: [],
      Stopped: [],
      Idle: [],
      Offline: [],
      NeverConnected: [],
    };
    vehicles.forEach((vehicle) => {
      const status = vehicle.position.status.status;
      switch (status) {
        case "running":
          this.statusData.Running.push(vehicle);
          break;
        case "stop":
          this.statusData.Stopped.push(vehicle);
          break;
        case "dormant":
          this.statusData.Idle.push(vehicle);
          break;
        case "Offline":
          this.statusData.Offline.push(vehicle);
          break;
        case "Never Connected":
          this.statusData.NeverConnected.push(vehicle);
          break;
        default:
          break;
      }
    });

    return this.statusData;
  }
  filterByCategory(category: string) {
    if (category !== "") {
      switch (category) {
        case "Running":
          this.fileredVehicles = this.statusData.Running;
          break;
        case "Stopped":
          this.fileredVehicles = this.statusData.Stopped;
          break;
        case "Idle":
          this.fileredVehicles = this.statusData.Idle;
          break;
        case "Offline":
          this.fileredVehicles = this.statusData.Offline;
          break;
        case "All":
          this.fileredVehicles = this.statusData.All; // Show all vehicles
          break;
        case "NeverConnected":
          this.fileredVehicles = this.statusData.NeverConnected;
          this.clearMarkerCluster();
          break;
        default:
          console.error("Unknown category:", category);
          this.fileredVehicles = this.statusData.All; // Show all vehicles
      }
    }
    this.fileredVehicles.map((vehicle) => {
      if (vehicle.position.status.status !== "Never Connected") {
        setTimeout(() => {
          this.createMarkerCluster(this.fileredVehicles);
        }, 1000);
      }
    });
  }
}
