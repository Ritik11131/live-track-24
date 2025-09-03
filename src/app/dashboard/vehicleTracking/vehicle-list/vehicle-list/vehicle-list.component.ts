import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { InputTextModule } from "primeng/inputtext";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import * as L from "leaflet";
import "leaflet.markercluster";
import "leaflet-rotatedmarker";
import { VehicleStatusData } from "src/app/models/vehicleStatusData";
import { VehicleListViewModel } from "src/app/viewModels/vehicleList.viewModel";
import { MapData, MapUtils } from "src/app/dashboard/commonComponents/common";
import { VehicleDetailMapperService } from "src/app/service/vehicle-detail-mapper.service";
@Component({
  selector: "app-vehicle-list",
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    DividerModule,
    ButtonModule,
    FormsModule,
  ],
  templateUrl: "./vehicle-list.component.html",
  styleUrl: "./vehicle-list.component.scss",
})
export class VehicleListComponent implements OnInit {
  searchQuery: string = "";
  vehicle_info: MapData[] = [];
  filteredVehicles: MapData[] = [];
  selectedVehicles:MapData[]=[];
  categories: any[] = [];
  statusData!: VehicleStatusData;
  category: string = "All";
  private markerClusterGroup!: any;
  refreshInterval!: any;
  @Output() shiftView = new EventEmitter<any>();

  activeCategoryIndex: number = 0;
  @Input() map!: L.Map;
  constructor(
    private vehicleListViewModel: VehicleListViewModel,
    private vehicleDetailsMapper: VehicleDetailMapperService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      console.log(this.map);
      this.markerClusterGroup = MapUtils.getMarkerCluster();
      this.map.addLayer(this.markerClusterGroup);
      this.getVehicleList();
    }, 300);

    this.refreshInterval = setInterval(() => {
      if(this.vehicle_info.length < 50){
      this.getVehicleList();}
    }, 10000);
  }

  getVehicleList(): void {
   
    this.vehicleListViewModel.getVehicleList().subscribe({
      next: (response) => {
        debugger
        const data = this.vehicleDetailsMapper.getSummary(response.data);
        const details = data;
        this.categories = details["summary"];
        this.vehicle_info = details["details"];
        this.filteredVehicles = this.vehicle_info;
        if (this.category !== "All") {
          this.filterByCategory(this.category, this.activeCategoryIndex);
        }
        if (this.searchQuery !== "") {
          this.search();
        }
        this.setupUi(this.filteredVehicles);
        this.statusData = this.groupVehiclesByStatus(this.vehicle_info);
        console.log("Login successful:", response);
      },
      error: (error) => {
        console.error("Login failed:", error);
      },
    });
  }

  setupUi(data: any[]) {
    MapUtils.clearClusterMarker(this.markerClusterGroup);

    data.forEach((d: MapData) => {
      try {
        let marker = MapUtils.drawMarkerOnMap(d, () => {});

        this.markerClusterGroup.addLayer(marker);

      } catch (e) {
        console.error(e);
      }
    });
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
  getStatusDetails(status: string): {
    color: string;
    iconPath: string;
    statusName: string;
  } {
    switch (status.toLowerCase().replace(/\s+/g, "")) {
      case "running":
        return {
          color: "#0fa46d",
          iconPath: "assets/demo/images/category/running_marker.svg",
          statusName: "Running",
        };
      case "stop":
      case "stopped":
        return {
          color: "#ff3d31",
          iconPath: "assets/demo/images/category/stop_marker.svg",
          statusName: "Stop",
        };
      case "dormant":
      case "idle":
        return {
          color: "#ffc13d",
          iconPath: "assets/demo/images/category/idle_marker.svg",
          statusName: "Idle",
        };
      case "neverconnected":
        return {
          color: "#A8A8A8",
          iconPath: "assets/demo/images/category/never_connected_marker.svg",
          statusName: "Never Connected",
        };
      case "all":
        return {
          color: "#395756",
          iconPath: "assets/demo/images/category/never_connected_marker.svg",
          statusName: "Never Connected",
        };
      case "pointexpired":
      case "offline":
      case "customerrechargeexpired":
        return {
          color: "#17628C",
          iconPath: "assets/demo/images/category/offline_marker.svg",
          statusName: "Offline",
        };
      default:
        return {
          color: "black",
          iconPath: "black", // Default icon path, if needed
          statusName: "black",
        };
    }
  }

  getCategoryName(category: string): MapData[] {
    switch (category) {
      case "Running":
        return this.statusData.Running;

      case "Stopped":
        return this.statusData.Stopped;

      case "Idle":
        return this.statusData.Idle;

      case "Offline":
        return this.statusData.Offline;

      case "All":
        return this.statusData.All; // Show all vehicles

      case "Never Connected":
        return this.statusData.NeverConnected;

      default:
        console.error("Unknown category:", category);
        return this.statusData.All; // Show all vehicles
    }
  }
  search() {
    this.selectedVehicles = []; // Clear the selected vehicles array

    this.filteredVehicles = this.getCategoryName(this.category).filter((info) =>
      info
        .device!.vehicleNo.toLowerCase()
        .includes(this.searchQuery.toLowerCase())
    );

    this.filteredVehicles.map((vehicle) => {
      if (vehicle.position.status.status !== "Never Connected") {
        this.selectedVehicles.push(vehicle)
      }
    });
    this.setupUi(this.selectedVehicles)
  }

  filterByCategory(category: string, index: number) {
    this.selectedVehicles = []; // Clear the selected vehicles array

    this.category = category;
    this.activeCategoryIndex = index;
    if (category !== "") {
      switch (category) {
        case "Running":
          this.filteredVehicles = this.statusData.Running;
          break;
        case "Stopped":
          this.filteredVehicles = this.statusData.Stopped;
          break;
        case "Idle":
          this.filteredVehicles = this.statusData.Idle;
          break;
        case "Offline":
          this.filteredVehicles = this.statusData.Offline;
          break;
        case "All":
          this.filteredVehicles = this.statusData.All; // Show all vehicles
          break;
        case "NeverConnected":
          this.filteredVehicles = this.statusData.NeverConnected;
          break;
        default:
          console.error("Unknown category:", category);
          this.filteredVehicles = this.statusData.All; // Show all vehicles
      }
    }
    if (this.searchQuery !== "") {
      this.filteredVehicles = this.filteredVehicles.filter((info) =>
        info
          .device!.vehicleNo.toLowerCase()
          .includes(this.searchQuery.toLowerCase())
      );
    }
    this.filteredVehicles.map((vehicle) => {
      if (vehicle.position.status.status !== "Never Connected") {
        this.selectedVehicles.push(vehicle)
      }
    });
    this.setupUi(this.selectedVehicles)
  }
  isActiveCategory(index: number): boolean {
    return this.activeCategoryIndex === index;
  }
  showDetails(value: MapData): void {
    MapUtils.clearClusterMarker(this.markerClusterGroup);
    console.log(value);
  }
  ngOnDestroy() {
    this.stopDashboardRefresh();
  }
  stopDashboardRefresh() {
    clearInterval(this.refreshInterval);
  }
}
