import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ToastModule } from "primeng/toast";
import { CommonModule, formatDate } from "@angular/common";
import { InputTextModule } from "primeng/inputtext";
import { PaginatorModule } from "primeng/paginator";
import { ReactiveFormsModule } from "@angular/forms";
import { ToastService } from "src/app/service/toast.service";
import { HelperMap, MapData } from "../../../../helper-map";
import { ChartModule } from "primeng/chart";
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { DividerModule } from "primeng/divider";
import { MultiSelectModule } from "primeng/multiselect";
import { ConfigService } from "src/app/service/config.service";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { MenuItem } from "primeng/api";
import { TabMenuModule } from "primeng/tabmenu";
import { SkeletonModule } from "primeng/skeleton";
import { VehicleListService } from "../../../../service/vehicle-list.service";
import { RippleModule } from "primeng/ripple";
import { LatLng, Marker } from "leaflet";
import "leaflet.animatedmarker/src/AnimatedMarker";
import { TabViewModule } from "primeng/tabview";
import { PushDataService } from "../../../service/push-data.service";
import { MessageService } from "primeng/api";
import { config } from "src/config";
import { DatePipe } from "@angular/common";
import { Subscription } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { StopReport } from "src/app/dashboard/report/domain/stopReport.model";
import { GeocodingService } from "src/app/service/geocoding.service";
import { CommonUtils } from "src/app/utils/commonUtils";
import { map } from "rxjs/operators";
import { interval } from "rxjs";
import * as L from "leaflet"
import { vehicleListRepository } from "../../domain/vehicleList.repository";
import { VehicleDetailMapperService } from "../../../../service/vehicle-detail-mapper.service";
import { IdleReport } from "src/app/dashboard/report/domain/idleReport.model";
import { VehicleStatusData } from "src/app/models/vehicleStatusData";
import { PlaybackController } from "../../domain/playback";
import { GeofenceRepository } from "src/app/dashboard/geofence_module/geofence/domain/geofence.repository";
import { MapUtils } from "src/app/dashboard/commonComponents/common";
@Component({
  selector: "app-vehicle-list",
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    MultiSelectModule,
    InputTextModule,
    PaginatorModule,
    SkeletonModule,
    ReactiveFormsModule,
    ChartModule,
    DividerModule,
    RouterOutlet,
    ButtonModule,
    CheckboxModule,
    TabMenuModule,
    RippleModule,
    TabViewModule,
    ProgressSpinnerModule,
    DatePipe,
  ],
  templateUrl: "./vehicle-list.component.html",
  styleUrls: ["./vehicle-list.component.scss"],
  providers: [DatePipe, vehicleListRepository,GeofenceRepository],
})
export class VehicleListComponent
  extends HelperMap<MapData>
  implements AfterViewInit, OnInit, OnDestroy
{
  showTemplate: string = "device-list";
  isLarge: boolean = false;
  items: MenuItem[] | undefined;
  activeItem: MenuItem | undefined;
  vehicle_info: MapData[] = [];
  fileredVehicles: MapData[] = [];
  categories: any[] = [];
  speed: number = 1;
  stopReport: StopReport[] = [];
  idleReport: IdleReport[] = [];
  tripStopLocations: StopReport[] = [];
  private playbackController!: PlaybackController;
  tripIdleLocations: IdleReport[] = [];
  // selectedCategoryIndex: number | null = null;
  searchQuery: string = "";
  playPause: boolean = false;
  position!: any[];
  deviceId: number = 0;
  linkedGeofences:any=[];
  selectedGeofences:number[]=[]
  activeCategoryIndex: number = 0;
  category: string = "All";
  replayControls: boolean = true;
  selectedStartDate!: string;
  selectedEndDate!: string;
  isLoading: boolean = false;
  fullDisplay: boolean = false;
  timeStamp: string = "00:00:00";
  totalTravelDistance: number = 0;
  VehicleSpeed: number = 0;
  stopMarkersShown: boolean = false;
  idleMarkersShown: boolean = false;
  selectedTabs!: any;
  statusData!: VehicleStatusData;
  private tripDataSubscription: Subscription | undefined;
  neverConnectedVehicleCount: boolean = true;
  progressSpinner: boolean = false;
  @ViewChild("seekbar") seekbar!: ElementRef; // Define ViewChild for seekbar
  details_title: string = "Vehicle(s) List";
  lastClicked!: MapData;
  selectedSpeed: number = 700;
  seekbarValue: number = 0;
  distanceTravelled: number = 0;
  progressWidth: string = "0%";
  private intervalSubscription!: Subscription;
  geofenceChecked: boolean = false;
  drawnGeofences: any[] = [];
  currentLocationMarker!:L.Marker;
  constructor(
    private configService: ConfigService,
    private vehicleListRepo: VehicleListService,
    private router: Router,
    private pushDataService: PushDataService,
    private geoCoder: GeocodingService,
    private positionSummary: VehicleDetailMapperService,
    public route: ActivatedRoute,
    private vehicleListRepository: vehicleListRepository,
    private toastService: ToastService,
    private geofenceRepo: GeofenceRepository
  ) {
    super();
    this.items = [
      { label: "Details", icon: "pi pi-fw pi-home", routerLink: "details" },
      { label: "Trips", icon: "pi pi-fw pi-calendar", routerLink: "trips" },
      { label: "Stops", icon: "pi pi-fw pi-stop-circle", routerLink: "stops" },
    ];
  }
  getcolor1(color: string) {
    switch (color) {
      case "running":
      case "Running":
        return "#0fa46d";
      case "stop":
      case "Stopped":
        return "#ff3d31";
      case "dormant":
      case "Idle":
        return "#ffc13d";
      case "Never Connected":
      case "NeverConnected":
        return "#A8A8A8";

      case "All":
        return "#395756";
      case "Point Expired":
      case "Offline":
      case "Customer recharge expired":
        return "#17628C";
      default:
        return "black";
    }
  }
  getColor(color: string): string {
    switch (color) {
      case "running":
      case "Running":
        return "assets/demo/images/category/running_marker.svg";
      case "stop":
      case "Stopped":
        return "assets/demo/images/category/stop_marker.svg";
      case "dormant":
      case "Idle":
        return "assets/demo/images/category/idle_marker.svg";
      case "Never Connected":
      case "NeverConnected":
      case "All":
        return "assets/demo/images/category/never_connected_marker.svg";
      case "Point Expired":
      case "Offline":
      case "Customer recharge expired":
        return "assets/demo/images/category/offline_marker.svg";
      default:
        return "black"; // Default color
    }
  }

  getStatusName(status: string): string {
    switch (status) {
      case "running":
        return "Running";
      case "stop":
        return "Stop";
      case "dormant":
        return "Idle";
      case "Never Connected":
        return "Never Connected";
      case "Point Expired":
      case "Offline":
      case "Customer recharge expired":
        return "Offline";
      default:
        return "black"; // Default color
    }
  }

  playPauseFunction() {
    if (!this.isMarkerMoving()) {
      this.startMarkerMovement(this.position, this.selectedSpeed);
    } else {
      this.stopMarkerMovement();
    }
    this.playPause = !this.playPause;
  }

  updateProgress() {
    const newPosition = this.seekbarValue / 100; // Assuming seekbar value is in percentage
    this.moveMarkerAlongPolyline(this.position, newPosition); // Update the marker position  }
  }

  restartMovement() {
    this.seekbarValue = 0;
    this.speed = 1;
    this.selectedSpeed = 700;

    this.reStartMovement(this.position, this.selectedSpeed);
  }

  onActiveItemChange(event: MenuItem) {
    this.activeItem = event;
  }

  ngOnInit(): void {
    debugger;
    console.log(this.selectedTabs);

    this.configService.setConfigSubject$.subscribe((data) => {
      console.log(this.selectedTabs);

      if (data) {
        this.selectedTabs = config.configJson.webConfig.options;
        console.log(this.selectedTabs);
        this.updateItems();
      }
    });

    this.replayControls = true;
    this.tripDataSubscription = this.vehicleListRepo
      .receivetripData()
      .subscribe((tripData: any) => {
        (this.deviceId = tripData.deviceId),
          (this.selectedStartDate = tripData.startDate),
          (this.selectedEndDate = tripData.endDate);

        if (Object.keys(tripData).length !== 0) {
          this.getLocationHistory();
          this.getTripStopLocations();
          this.getTripIdleLocations();
        }
      });
    // this.updateLabel();
    this.vehicleListRepo.dateRangeSelected.subscribe(
      (dates: { startDate: string; endDate: string }) => {
        this.selectedStartDate = dates.startDate;
        this.selectedEndDate = dates.endDate;
        if (this.router.url.includes("/tracking/details")) {
          this.getLocationHistory();
          this.getTripStopLocations();
          this.getTripIdleLocations();
        }
      }
    );
  }

  updateItems() {
    console.log(this.selectedTabs);
    if (this.selectedTabs.bmsSOC && false) {
      this.items?.push({
        label: "Soc Analysis",
        icon: "pi pi-chart-line",
        routerLink: "socanalysis",
      });
    }
    if (this.selectedTabs.temperature && false) {
      this.items?.push({
        label: "Temp Analysis",
        icon: "pi pi-chart-line",
        routerLink: "tempanalysis",
      });
    }
  }
  getTripStopLocations() {
  
    this.vehicleListRepository
      .getStopData(
        this.deviceId,
        this.selectedStartDate,
        this.selectedEndDate,
        "stopReport"
      )
      .subscribe(
        (data) => {
          this.tripStopLocations = data;
        },
        this.toastService.errorToast,
        () => {}
      );
  }

  showStopPointOnMap(stop: StopReport) {
    this.createStopMarker(this.geoCoder, stop, "Stop");
  }
  showIdlePointOnMap(idle: IdleReport) {
    this.createStopMarker(this.geoCoder, idle, "Idle");
  }
  getTripIdleLocations() {
    this.vehicleListRepository
      .getIdleData(
        this.deviceId,
        this.selectedStartDate,
        this.selectedEndDate,
        "idleReport"
      )
      .subscribe(
        (data) => {
          this.tripIdleLocations = data;
        },
        this.toastService.errorToast, 
        () => {}
      );
  }
  ngAfterViewInit(): void {
    debugger
    this.initMap();
    this.getVehicleList();
    // for calling it every 30 sec oif
    this.intervalSubscription =interval(30000).subscribe(() => {
      // Check if the length of vehicle_info is more  than 50 devices
      if (this.vehicle_info.length < 50 && this.showTemplate == "device-list") {
        // If vehicle_info length is less than 50, call getVehicleList
        this.getVehicleList();
      }
    });
    this.markerMoved.subscribe((seekbarValue: number) => {
      // Update the seekbar value when the marker moves
      this.seekbarValue = seekbarValue;
    });
    this.distanceMoved.subscribe((distanceValue: number) => {
      // Update the seekbar value when the marker moves
      this.distanceTravelled = distanceValue;
    });

    this.currentPlaybackData.subscribe((timedata: string) => {
      this.timeStamp = CommonUtils.convertUTCToIST(timedata);
    });
    this.currentSpeed.subscribe((speedData: number) => {
      this.VehicleSpeed = speedData;
    });

    this.route.queryParams.subscribe((v) => {
      const deviceId = Number(v["deviceId"]) || 0;
      if (deviceId != 0) {
        setTimeout(() => {
          this.moveToDetailsScreen(deviceId);
        }, 500);
      }
    });
  }

  closeHistoryReplay() {
    this.replayControls = true;
    this.clearPolylineFromMap();
    this.timeStamp = "00:00:00";
    this.VehicleSpeed = 0;
    this.distanceTravelled = 0;
    this.speed = 1;
    this.playPause = false;
    this.seekbarValue = 0;
  }
  refreshDetailPage() {
    this.vehicleListRepo.refreshDetailPageCall();
  }
  getVehicleList() {
    this.vehicleListRepository.getVehicleListData().subscribe(
      (data) => {
        this.isLoading = true;
        const details = data;
        this.categories = details["summary"];
        this.vehicle_info = details["details"];
        this.fileredVehicles = this.vehicle_info;

        if (this.category !== "All") {
          this.filterByCategory(this.category, this.activeCategoryIndex);
        }
        if (this.searchQuery !== "") {
          this.search();
        }
        this.statusData = this.groupVehiclesByStatus(this.vehicle_info);
        this.neverConnectedVehicleCount = Object.values(this.categories)
          .slice(1, 5)
          .every((obj) => obj.count === 0);
        if (this.fileredVehicles.length !== 0) {
         const filterList= this.fileredVehicles.filter((vehicle) => {
            return vehicle.position!.status!.status !== "Never Connected"
          });
          this.createCluster(filterList);

        }
      },
      (e) => {
        this.toastService.toastMessage("error", "Message", e.error.data);

        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      }
    );
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

  convertTimeDuration(input: string | undefined): string | undefined {
    return CommonUtils.convertTimeDuration(input);
  }

  onMarkerClicked(marker: Marker, data: MapData): void {
    this.showInfoWindow(marker, data.device?.vehicleNo ?? "");
  }

  switchView(): void {
    this.showTemplate =
      this.showTemplate == "device-details" ? "device-list" : "device-details";
    this.isLarge = !this.isLarge;
    this.invalidateMap();
this.removeMarker(this.currentLocationMarker)
    if (!this.isLarge) {
      // this.removeMarker(this.marker);
      this.vehicleListRepo.executeRemoveMarkerFunction();
      console.log(this.vehicle_info)
      this.createCluster(this.vehicle_info);
    }
  }

  showIdlePoints() {
    this.idleMarkersShown = !this.idleMarkersShown;
    if (this.idleMarkersShown) {
      this.vehicleListRepository
        .getIdleData(
          this.deviceId,
          this.selectedStartDate,
          this.selectedEndDate,
          "idleReport"
        )
        .subscribe(
          (data) => {
            this.idleReport = data;
            this.createIdleMarkers(this.geoCoder, this.idleReport);
          },
          (e) => {
            this.toastService.toastMessage("error", "Message", e.error.data);
          },
          () => {}
        );
    } else {
      this.clearIdleMarkers(this.idleReport);
    }
  }
  showStopPoints() {
    this.stopMarkersShown = !this.stopMarkersShown;
    if (this.stopMarkersShown) {
      this.vehicleListRepository
        .getStopData(
          this.deviceId,
          this.selectedStartDate,
          this.selectedEndDate,
          "stopReport"
        )
        .subscribe(
          (data) => {
            this.stopReport = data;

            this.createStopMarkers(this.geoCoder, this.stopReport);
          },
          (e) => {
            this.toastService.toastMessage("error", "Message", e.error.data);
          },
          () => {}
        );
    } else {
      this.clearStopMarkers(this.stopReport);
    }
  }

  showDetails(value: MapData): void {
    if (value.position.status.status === "Never Connected") {
      this.toastService.toastMessage(
        "error",
        "Error",
        "This Device was Never Connected"
      );
    } else {
      this.vehicleListRepo.setData(value.device?.id);
      this.deviceId = value.device?.id ?? 0;
      this.lastClicked = value;
      this.category='All'
      this.searchQuery=''
      this.fileredVehicles=this.vehicle_info
      this.clearMarkerCluster();
      this.activeCategoryIndex=0
      this.details_title = this.lastClicked.device?.vehicleNo!;
      this.pushDataService.pushData(value, this);
      this.getGeofenceByDeviceId()
      this.switchView();
    }
  }

  isActiveCategory(index: number): boolean {
    return this.activeCategoryIndex === index;
  }

  private createCluster(values: MapData[]): void {
    // this.clearMarkersFromMap()
    this.clearClusterGroup();
    this.details_title = "Vehicle(s) List";
    values.forEach((value, index) => {
      if (value.position.details.vStatus) {
        this.marker = this.createCarMarker(
          value.position.position as LatLng,
          value.position.heading ?? 0,
          value.device.vehicleType,
          value.position.status.status,
          value.position?.details.vStatus
        );
        this.setMarkerInMarkerCluster(this.marker);
        this.setMarkerCustomData(this.marker, value);
      }
    });
    this.fitMarkerClusterBounds();
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
    this.fileredVehicles = this.getCategoryName(this.category).filter((info) =>
      info
        .device!.vehicleNo.toLowerCase()
        .includes(this.searchQuery.toLowerCase())
    );
    let device = this.getCategoryName(this.category).find((d) =>
      d.device.vehicleNo.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    if (device != undefined) {
      this.map.setView(
        [device.position.position.lat, device.position.position.lng],
        20,
        { animate: true, duration: 1.0 }
      );
    }
    this.fileredVehicles.map((vehicle) => {
      if (vehicle.position.status.status !== "Never Connected") {
        setTimeout(() => {
          this.createCluster(this.fileredVehicles);
        }, 1000);
      }
    });
  }

  filterByCategory(category: string, index: number) {
    this.category = category;
    this.activeCategoryIndex = index;
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
          break;
        default:
          console.error("Unknown category:", category);
          this.fileredVehicles = this.statusData.All; // Show all vehicles
      }
    }
    if (this.searchQuery !== "") {
      this.fileredVehicles = this.fileredVehicles.filter((info) =>
        info
          .device!.vehicleNo.toLowerCase()
          .includes(this.searchQuery.toLowerCase())
      );
    }
    // Clear markers from the map
    this.clearMarkerCluster();
    // Wait for the markers to be cleared before creating the cluster
    this.fileredVehicles.map((vehicle) => {
      if (vehicle.position.status.status !== "Never Connected") {
        setTimeout(() => {
          this.createCluster(this.fileredVehicles);
        }, 1000);
      }
    });
  }

  moveToDetailsScreen(id: number) {
    this.vehicleListRepo.getVehicleById(id).subscribe((data) => {
      const r = this.positionSummary.getSummary([data]);
      this.showDetails(r.details[0]);
    });
  }

  getLocationHistory() {
    this.clearClusterGroup();
    this.progressSpinner = true;
    this.vehicleListRepository
      .getCoordinatesData(
        this.deviceId,
        this.selectedStartDate,
        this.selectedEndDate
      )
      .subscribe(
        (d) => {
          console.log(d)
          if (d.length === 0) {
            this.toastService.toastMessage(
              "error",
              "Error",
              "No location history data available."
            );
            this.progressSpinner = false;
            return; // Exit the function early if there's no data
          }
          this.position = d;
          this.replayControls = false;
          this.totalTravelDistance =
            (d[d.length - 1].details?.totalDistance -
              d[0].details?.totalDistance) /
            1000;
          this.drawPolylineOnMap(
            this.geoCoder,
            this.position,
            this.lastClicked.device.vehicleType
          );
          this.removeMarker(this.currentLocationMarker)
          this.progressSpinner = false;
        },
        (e) => {
          this.toastService.toastMessage(
            "error",
            "Message",
            e.error?.data.message
          );

          this.router.navigate(["/"]).then((d) => {});
          this.progressSpinner = false;
        },
        () => {
          this.progressSpinner = false;
        }
      );
  }

  changeSpeed(): void {
    this.speed < 5 ? (this.speed += 1) : (this.speed = 1);
    this.selectedSpeed = 800 - 100 * this.speed;
    this.changeMarkerSpeed(this.position, this.selectedSpeed); // Change the marker speed dynamically
  }

  toggleArrow() {
    this.fullDisplay = !this.fullDisplay; // Toggle the boolean value
  }

  ngOnDestroy() {
    if (this.tripDataSubscription) {
      this.tripDataSubscription.unsubscribe();
    }

      if (this.intervalSubscription) {
        this.intervalSubscription.unsubscribe();
      }
    this.closeHistoryReplay();
  }

  clearGeofences() {
    this.drawnGeofences.forEach(geofence => {
      this.map.removeLayer(geofence);
    });
    this.drawnGeofences = [];
  }

  loadGeofence(id: number) {
    this.geofenceRepo.loadGeofence(id).subscribe((response: any) => {
      const geofence = response.data;
      const geojson = JSON.parse(geofence.geofenceGeometry);

      if (geojson.type === "FeatureCollection") {
        const feature = geojson.features[0];

        if (feature.geometry.type === "Point") {
          const center = L.latLng(
            feature.geometry.coordinates[1],
            feature.geometry.coordinates[0]
          );
         const  radius = geojson.features[0].properties.radius ;
          this.createCircle(center, radius);

          // Set the map bounds to fit the circle
          const bounds = center.toBounds(radius * 2); // Create bounds with the diameter
          // this.map.fitBounds(bounds);
        } else if (feature.geometry.type === "Polygon") {
          const polygonPoints = feature.geometry.coordinates[0]
            .slice(0, -1)
            .map((coord: any) => {
              const latlng = L.latLng(coord[1], coord[0]);
              return latlng;
            });
          this.createPolygonFromPoints(polygonPoints);

          // Set the map bounds to fit the polygon
          const bounds = L.latLngBounds(polygonPoints);
          this.map.fitBounds(bounds);
        }
      }

   
    });
  }
  createPolygonFromPoints(polygonPoints:L.LatLng[]) {
    const polygon = L.polygon(polygonPoints, {
      color: "green",
      fillColor: "#0f0",
      fillOpacity: 0.5,
    });
    polygon.addTo(this.map);
    this.drawnGeofences.push(polygon);

  }
  getGeofenceByDeviceId() {
   
 
    this.geofenceRepo.getGeofenceByDeviceId(this.deviceId).subscribe(
      (d) => {
        this.linkedGeofences = d;
      },
      (e) => {

      },
      () => {}
    );
  }
  createCircle(center: L.LatLng, radius: number) {
    const circle = L.circle(center, { radius });
    circle.addTo(this.map);
    this.drawnGeofences.push(circle);

}
linkedGeofenceDropdown(event:any){
  this.clearGeofences()
const linkedGeofenceIds=event.value;
linkedGeofenceIds.forEach((id:number)=>{
  this.loadGeofence(id)
})
}
plotCurrentLocation(): void {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      // Set the view of the map to the current location
      this.map.setView([lat, lon], 18);
      const customIcon = L.icon({
        iconUrl: 'assets/demo/images/geofence/geofence_icon.png', // Path to your custom icon
        iconSize: [32, 32], // size of the icon
        iconAnchor: [16, 32], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -32] // point from which the popup should open relative to the iconAnchor
      });
      // Add a marker at the current location
     this.currentLocationMarker= L.marker([lat, lon], { icon: customIcon }).addTo(this.map)
        .bindPopup('You are here')
        .openPopup();
    }
    );
  } else {
    console.error('Geolocation is not supported by this browser.');
  }
}

}
