import {
  AfterViewInit,
  Component,
  OnInit,
  ViewContainerRef,
  ViewChild,
  ElementRef,
} from "@angular/core";
import * as L from "leaflet";
import { Table } from "primeng/table";
import { RadioButtonModule } from "primeng/radiobutton";
import { FormsModule } from "@angular/forms";
import { SliderModule } from "primeng/slider";
import { ButtonModule } from "primeng/button";
import { CommonModule } from "@angular/common";
import { InputTextModule } from "primeng/inputtext";
import { GeofenceService } from "../../domain/geofence.service";
import { TooltipModule } from "primeng/tooltip";
import { SelectButtonModule } from "primeng/selectbutton";
import { InputSwitchModule } from "primeng/inputswitch";
import { config } from "src/config";
import { CheckboxModule } from "primeng/checkbox";
import { ToastService } from "src/app/service/toast.service";
import { GeofenceRepository } from "../../domain/geofence.repository";
import { DropdownModule } from "primeng/dropdown";
import { TableModule } from "primeng/table";
import { Geofence } from "../../domain/geofence.model";
import { SkeletonModule } from "primeng/skeleton";
import { ReactiveFormsModule } from "@angular/forms";
import { TabViewModule } from "primeng/tabview";
import { AccordionModule } from "primeng/accordion";
import { SpeedDialModule } from "primeng/speeddial";
import { MenuItem } from "primeng/api";
import { ConfirmationDialogService } from "src/app/dashboard/commonComponents/confirmationDialog/domain/confirmation-dialog.service";
import { GeofenceLinkService } from "../../../link/domain/linkGeofence.service";
import { MappedGeofence } from "../../domain/mappedGeofence.model";
@Component({
  selector: "app-geofence",
  standalone: true,
  imports: [
    InputTextModule,
    ButtonModule,
    SpeedDialModule,
    CommonModule,
    SliderModule,
    FormsModule,
    CheckboxModule,
    ReactiveFormsModule,
    InputSwitchModule,
    DropdownModule,
    TableModule,
    SkeletonModule,
    SelectButtonModule,
    TooltipModule,
    RadioButtonModule,
    TabViewModule,
    AccordionModule,
  ],
  templateUrl: "./geofence.component.html",
  styleUrls: ["./geofence.component.scss"],
  providers: [GeofenceRepository],
})
export class GeofenceComponent implements OnInit, AfterViewInit {
  @ViewChild("autocompleteInput", { static: false })
  autocompleteInput!: ElementRef<HTMLInputElement>;
  items!: MenuItem[] | null;

  value!: string;
  checked: boolean = false;

  selectedGeofence!: Geofence | undefined;
  devices: { name: string; code: number }[] = [];
  deviceData: boolean = false;
  userData: boolean = false;
  linkedDevices: { [key: number]: MappedGeofence[] } = {};
  displayLinkedItems: { [key: number]: boolean } = {};
  map!: L.Map;
  mapGeofence: MappedGeofence[] = [];
  circle!: L.Circle | null;
  polygon!: L.Polygon | null;
  polygonPoints: L.LatLng[] = [];
  geofenceType: "circle" | "polygon" = "circle";
  radius: number = 100;
  geofenceName: string = "";
  geofences: Geofence[] = [];
  selectDeviceID: number = 0;
  toggleButton: boolean = false;
  selectedGeofenceId: number | null = null;
  fkCustomerUserId: number | null = null;
  showing: boolean = false;
  activeTabIndex: number = 0; // Property to manage the active tab
  button: string = "Create Geofence";
  borderMarker!: L.Marker | null;
  radiusLabel: L.Marker | null = null;
  centerMarker!: L.Marker | null;

  constructor(
    private geofenceService: GeofenceService,
    private geofenceRepo: GeofenceRepository,
    private toastService: ToastService,
    private geofenceLinkService: GeofenceLinkService,
    private viewContainerRef: ViewContainerRef,
    private confirmationDialogService: ConfirmationDialogService,

  ) {}

  ngOnInit() {
    this.items = [
      {
        icon: "pi pi-circle",
        command: () => {
          this.toggleGeofenceType("circle");
        },
      },
      {
        icon: "pi pi-stop",
        command: () => {
          this.toggleGeofenceType("polygon");
        },
      },
    ];
    this.getDeviceList();
    // Initialize the Leaflet map and tile layer
    this.map = L.map("geofenceMap").setView([28.6139, 77.2088], 18);
    let options: any = {
      maxZoom: 20,
      attribution: "©",
    };

    // Set subdomains option if currentMap is not openstreetmap
    if (!config.currentMap.includes("openstreetmap")) {
      options.subdomains = ["mt0", "mt1", "mt2", "mt3"];
    }

    // Add the tile layer to the map
    L.tileLayer(config.currentMap, options).addTo(this.map);

    // Add click event listener to the map
    this.map.on("click", (e: any) => {
        this.addMarker(e.latlng);
    });

 

    // Fetch geofences from repository
    this.fetchGeofences();
  }

  ngAfterViewInit(): void {
    // Initialize autocomplete after view is initialized
    const input = document.getElementById(
      "autocomplete-input"
    ) as HTMLInputElement;
    this.geofenceService.autocomplete(input);

    // Subscribe to the placeSelected event
    this.geofenceService.placeSelected.subscribe((place: any) => {
      // Update the map to the selected place

      const latlng = new L.LatLng(
        place.geometry.location.lat(),
        place.geometry.location.lng()
      );
      this.map.setView(latlng, 18);
      // if (this.geofenceType === "circle") {
      //   this.createCircle(latlng);
      // } else if (this.geofenceType === "polygon") {
      //   this.addPolygonPoint(latlng);
      // }
    });
  }

  clearMarkers() {
    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });
  }

  fetchGeofences() {
    this.geofenceRepo.getGeofences().subscribe((response: any) => {
      this.geofences = response;
    }, this.toastService.errorToast);
  }

  toggleGeofenceType(type: "circle" | "polygon") {
    this.geofenceType = type;
    this.clearGeofenceLayers();
  }

  addMarker(latlng: L.LatLng) {
    if (this.geofenceType === "circle") {
      // Remove the previous circle if it exists
      if (this.circle) {
        this.map.removeLayer(this.circle);
        this.circle = null;
      }
      this.createCircle(latlng, this.radius);
    } else {
      this.addPolygonPoint(latlng);
    }
    this.map.setView(latlng, 18); // Adjust the zoom level as needed
  }

  addCustomMarker(latlng: L.LatLng) {
    const icon = L.icon({
      iconUrl: "assets/demo/images/geofence/geofence_icon.png",
      iconSize: [32, 32], // adjust the size as needed
      iconAnchor: [16, 32], // point of the icon which will correspond to marker's location
    });

    const marker = L.marker(latlng, { icon, draggable: true }).addTo(this.map);

    // Event to update the circle or polygon when the marker is dragged
    marker.on("dragend", (event) => {
      const newLatLng = event.target.getLatLng();
      if (this.geofenceType === "circle" && this.circle) {
        this.circle.setLatLng(newLatLng);
        this.map.setView(newLatLng, 18);
      } else if (this.geofenceType === "polygon" && this.polygon) {
        const index = this.polygonPoints.findIndex(
          (point) => point.lat === latlng.lat && point.lng === latlng.lng
        );
        if (index !== -1) {
          this.polygonPoints[index] = newLatLng;
          this.updatePolygon();
        }
      }
    });
  }
  updatePolygon() {
    if (this.polygonPoints.length === 0) {
      console.error("Polygon points array is empty");
      return;
    }
    // Remove the previous polygon if it exists
    if (this.polygon) {
      this.map.removeLayer(this.polygon);
    }

    // Clear old markers
    this.clearPolygonMarkers();

    // Create a new polygon with the updated points
    this.polygon = L.polygon(this.polygonPoints, {
      color: "green",
      fillColor: "#0f0",
      fillOpacity: 0.5,
    }).addTo(this.map);

    // Add markers at each corner of the polygon
    this.polygonPoints.forEach((point) => this.addCustomMarker(point));

    // Check for valid bounds before applying fitBounds
    const bounds = this.polygon.getBounds();
    if (bounds.isValid()) {
      this.map.fitBounds(bounds);
    } else {
      console.error("Polygon bounds are not valid");
    }
  }

  clearPolygon() {
    // Remove the old polygon from the map
    if (this.polygon) {
      this.map.removeLayer(this.polygon);
      this.polygon = null;
    }

    // Clear the old polygon points
    this.polygonPoints = [];
  }

  clearPolygonMarkers() {
    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });
  }
  createCircle(center: L.LatLng, radius: number) {
    console.log(radius)
    // Remove any existing circle, center marker, border marker, and radius label
    if (this.circle) {
      this.map.removeLayer(this.circle);
    }
    if (this.borderMarker) {
      this.map.removeLayer(this.borderMarker);
    }
    if (this.radiusLabel) {
      this.map.removeLayer(this.radiusLabel);
    }
    if (this.centerMarker) {
      this.map.removeLayer(this.centerMarker);
    }

    // Create the circle
    this.circle = L.circle(center, { radius }).addTo(this.map);

    // Create a draggable center marker
    this.centerMarker = L.marker(center, {
      draggable: true,
      icon: L.icon({
        iconUrl: "assets/demo/images/geofence/geofence_icon.png",
        iconSize: [32, 32],
      }),
    }).addTo(this.map);

    // Create a marker on the border of the circle
    const borderPoint = this.getPointOnCircle(center, radius);
    this.borderMarker = L.marker(borderPoint, {
      draggable: true,
      icon: L.icon({
        iconUrl: "assets/demo/images/geofence/geofence_icon.png",
        iconSize: [25, 25],
      }),
    }).addTo(this.map);

    // Create or update the label inside the circle
    this.radiusLabel = L.marker(center, {
      icon: L.divIcon({
        className: "radius-label",
        html: `<div style="font-weight:bold; padding: 2px; border-radius: 5px; font-size: 12px;">${Math.round(
          radius
        )} m</div>`,
        iconSize: [50, 50],
        iconAnchor: [50, 25],
      }),
    }).addTo(this.map);

    // Update the circle's radius when the border marker is dragged
    this.borderMarker.on("drag", (event: L.LeafletEvent) => {
      const newLatLng = (event as any).latlng;
      radius = center.distanceTo(newLatLng);

      if (radius >= 100) {
        this.circle?.setRadius(radius);
        // Update the label's radius
        if (this.radiusLabel) {
          this.radiusLabel.setIcon(
            L.divIcon({
              className: "radius-label",
              html: `<div style="font-weight:bold; padding: 2px; border-radius: 5px; font-size: 12px;">${Math.round(
                radius
              )} m</div>`,
              iconSize: [50, 50],
              iconAnchor: [50, 25],
            })
          );
        }
      } else {
        // Prevent the marker from being dragged closer than 100m
        const angle = this.calculateBearing(center, newLatLng);
        const newPoint = this.getLatLngAtDistance(center, 100, angle);
        this.borderMarker?.setLatLng(newPoint);
      }
    });

    // Update the circle's center when the center marker is dragged
    this.centerMarker.on("drag", (event: L.LeafletEvent) => {
      const newCenter = (event as any).latlng;
      this.circle?.setLatLng(newCenter);

      // Update the border marker position
      const newBorderPoint = this.getPointOnCircle(newCenter, radius);
      this.borderMarker?.setLatLng(newBorderPoint);

      // Update the radius label position
      this.radiusLabel?.setLatLng(newCenter);
    });
  }

  getPointOnCircle(center: L.LatLng, radius: number): L.LatLng {
    const latDiff = radius / 111000; // Convert meters to degrees
    const lat = center.lat + latDiff;
    const lng = center.lng;
    return L.latLng(lat, lng);
  }

  calculateBearing(start: L.LatLng, end: L.LatLng): number {
    const startLat = this.degreesToRadians(start.lat);
    const startLng = this.degreesToRadians(start.lng);
    const endLat = this.degreesToRadians(end.lat);
    const endLng = this.degreesToRadians(end.lng);

    const dLng = endLng - startLng;

    const y = Math.sin(dLng) * Math.cos(endLat);
    const x =
      Math.cos(startLat) * Math.sin(endLat) -
      Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

    return (this.radiansToDegrees(Math.atan2(y, x)) + 360) % 360;
  }

  getLatLngAtDistance(
    start: L.LatLng,
    distance: number,
    bearing: number
  ): L.LatLng {
    const R = 6371000; // Radius of the Earth in meters
    const lat1 = this.degreesToRadians(start.lat);
    const lon1 = this.degreesToRadians(start.lng);
    const d = distance / R;
    const bearingRad = this.degreesToRadians(bearing);

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(d) +
        Math.cos(lat1) * Math.sin(d) * Math.cos(bearingRad)
    );
    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(bearingRad) * Math.sin(d) * Math.cos(lat1),
        Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
      );

    return L.latLng(this.radiansToDegrees(lat2), this.radiansToDegrees(lon2));
  }

  degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  // Helper function to get LatLng from an offset
  getLatLngFromOffset(center: L.LatLng, offset: L.LatLng): L.LatLng {
    const lat = center.lat + offset.lat;
    const lng = center.lng + offset.lng;
    return L.latLng(lat, lng);
  }

  calculateLatLngOnCircle(
    center: L.LatLng,
    radius: number,
    angle: number
  ): L.LatLng {
    // Approximate latitude and longitude changes
    const earthRadius = 6378137; // Radius of Earth in meters
    const latChange = (radius / earthRadius) * (180 / Math.PI);
    const lngChange = latChange / Math.cos(center.lat * (Math.PI / 180));

    // Calculate the new position
    const newLat = center.lat + latChange * Math.cos(angle);
    const newLng = center.lng + lngChange * Math.sin(angle);

    return L.latLng(newLat, newLng);
  }

  addPolygonPoint(latlng: L.LatLng) {
    if (latlng && latlng.lat && latlng.lng) {
      this.polygonPoints.push(latlng);
      this.updatePolygon();
    } else {
      console.error("Invalid LatLng point added to polygon");
    }
  }

  updateCircle() {
    if (this.circle) {
      this.circle.setRadius(this.radius);
      const scaleFactor = 900;
      this.map.setZoom(
        Math.max(
          0,
          Math.min(19, Math.floor(15 - Math.log2(this.radius / scaleFactor)))
        )
      );
    }
  }

  generateGeofence() {
    if (this.autocompleteInput) {
      this.autocompleteInput.nativeElement.value = "";
    }
    if (!this.geofenceName) {
      alert("Please enter a name for the geofence");
      return;
    }

    if (this.geofenceType === "circle" && this.circle) {
      const center = this.circle.getLatLng();
      const radius = this.circle.getRadius();
      console.log(radius)
      const geoJson = this.createCircleGeoJson(center, radius);
      this.sendGeofenceData(geoJson, radius);
    } else if (
      this.geofenceType === "polygon" &&
      this.polygonPoints.length > 2
    ) {
      const geoJson = this.createPolygonGeoJson(this.polygonPoints);
      this.sendGeofenceData(geoJson, 0);
    } else {
      alert("Geofence is not properly defined");
    }
    this.clearGeofenceLayers();
    this.geofenceType = "circle";
  }

  createCircleGeoJson(center: L.LatLng, radius: number): any {
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [center.lng, center.lat],
          },
          properties: {
            radius: radius,
          },
        },
      ],
    };
  }

  createPolygonGeoJson(coordinates: L.LatLng[]): any {
    const closedCoordinates = [...coordinates, coordinates[0]]; // Append the first point at the end to close the polygon

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              closedCoordinates.map((point) => [point.lng, point.lat]),
            ],
          },
          properties: {
            color: "red",
          },
        },
      ],
    };
  }

  sendGeofenceData(geoJson: any, radius: number) {
    const payload = {
      color: "#FF5733",
      radius: radius,
      geometryName: this.geofenceName,
      Geojson: JSON.stringify(geoJson),
    };
    this.geofenceRepo.sendGeofence(payload).subscribe((response) => {
      this.fetchGeofences(); // Refresh the list of geofences
    });
  }

  loadGeofence(id: number) {
    this.geofenceRepo.loadGeofence(id).subscribe((response: any) => {
      const geofence = response.data;
      this.toggleButton = true;
      const geojson = JSON.parse(geofence.geofenceGeometry);
      console.log(geojson);
      this.clearGeofenceLayers();

      if (geojson.type === "FeatureCollection") {
        const feature = geojson.features[0];

        if (feature.geometry.type === "Point") {
          this.geofenceType = "circle";
          const center = L.latLng(
            feature.geometry.coordinates[1],
            feature.geometry.coordinates[0]
          );
          this.radius = geojson.features[0].properties.radius ;
          console.log(this.radius)
          this.createCircle(center, this.radius);

          // Set the map bounds to fit the circle
          const bounds = center.toBounds(this.radius * 2); // Create bounds with the diameter
          this.map.fitBounds(bounds);
        } else if (feature.geometry.type === "Polygon") {
          this.geofenceType = "polygon";
          this.polygonPoints = feature.geometry.coordinates[0]
            .slice(0, -1)
            .map((coord: any) => {
              const latlng = L.latLng(coord[1], coord[0]);
              this.addCustomMarker(latlng); // Add marker at each corner of the polygon
              return latlng;
            });
          this.createPolygonFromPoints();

          // Set the map bounds to fit the polygon
          const bounds = L.latLngBounds(this.polygonPoints);
          this.map.fitBounds(bounds);
        }
      }

      this.button = "Update Geofence";
      this.selectedGeofenceId = id;
      this.fkCustomerUserId = geofence.fkCustomerUserId;
      this.geofenceName = response.data.geometryName;
    });
  }

  createPolygonFromPoints() {
    this.polygon = L.polygon(this.polygonPoints, {
      color: "green",
      fillColor: "#0f0",
      fillOpacity: 0.5,
    });
    this.polygon.addTo(this.map);
  }

  updateGeofence() {
    if (this.selectedGeofenceId === null) {
      return;
    }

    if (this.geofenceType === "circle" && this.circle) {
      const center = this.circle.getLatLng();
      const radius = this.circle.getRadius();
      const geoJson = this.createCircleGeoJson(center, radius);
      this.sendUpdatedGeofenceData(geoJson, radius);
    } else if (
      this.geofenceType === "polygon" &&
      this.polygonPoints.length > 2
    ) {
      const geoJson = this.createPolygonGeoJson(this.polygonPoints);
      this.sendUpdatedGeofenceData(geoJson, 0);
    } else {
      alert("Geofence is not properly defined");
    }
    this.clearGeofenceLayers();
    this.button = "Create Geofence";
    this.toggleButton = false;
    this.geofenceType = "circle";
    this.geofenceName = "";
    this.selectDeviceID = 0;
  }

  sendUpdatedGeofenceData(geoJson: any, radius: number) {
    const payload = {
      id: this.selectedGeofenceId,
      fkCustomerUserId: this.fkCustomerUserId, // Assuming user ID is 1, change as needed
      color: "#FF5733",
      radius: radius,
      geometryName: this.geofenceName,
      Geojson: JSON.stringify(geoJson),
    };
    this.geofenceRepo
      .updateGeofence(this.selectedGeofenceId, payload)
      .subscribe(
        (response) => {
          this.fetchGeofences(); // Refresh the list of geofences
          this.selectedGeofenceId = null; // Reset selection
        },
        (error) => {
          console.error("Update failed:", error);
          alert("Failed to update geofence. Please try again.");
        }
      );
  }

  clearGeofenceLayers() {
    this.clearMarkers();
    if (this.button !== "Update Geofence") {
      if (this.geofenceName !== "") {
        this.geofenceName = "";
      }
      if (this.selectedGeofenceId !== null) {
        this.selectedGeofenceId = null;
      }
      if (this.fkCustomerUserId !== null) {
        this.fkCustomerUserId = null;
      }
    }
    if (this.circle) {
      this.map.removeLayer(this.circle);
      this.circle = null;
    }
    if (this.polygon) {
      this.map.removeLayer(this.polygon);
      this.polygon = null;
    }
    this.polygonPoints = [];
  }
  getDeviceList(): void {
    this.deviceData = true;

    this.devices = [];
    this.geofenceRepo.getDeviceData().subscribe(
      (d) => {
        this.devices = d;
        const dt = { name: "All", code: 0 };
        this.devices = [dt, ...this.devices];
      },
      this.toastService.errorToast,
      () => {
        this.deviceData = false;
      }
    );
  }
  unLinkGeofenceFromDevice(mappingId: number) {
    this.geofenceRepo.unLinkGeofence(mappingId).subscribe((data) => {
      this.toastService.toastMessage("success", "Success", data);
      this.loadLinkedDevices(this.selectedGeofenceId ?? 0);
    }, this.toastService.errorToast);
  }
  linkGeofence() {
    if (this.selectedGeofence !== null) {
      const geofenceId = this.selectedGeofence?.id;
      const geofenceName = this.selectedGeofence?.geometryName;
      this.geofenceLinkService
        .open(this.viewContainerRef, geofenceId ?? 0, geofenceName ?? "")
        .subscribe((result) => {
          if (result == "yes") {
            this.toastService.showSuccessToast(
              "Geofence have been linked successfully"
            );
            this.loadLinkedDevices(this.selectedGeofenceId ?? 0);
          } else {
            console.log("Dialog was cancelled");
          }
        });
    }
  }

  deleteGeofence() {
    if (this.selectedGeofence !== null || undefined) {
      this.confirmationDialogService
      .open(this.viewContainerRef, "DELETE")
      .subscribe((result) => {
        if (result == "yes") {
          // debugger;
          this.geofenceRepo
          .deleteGeofence(this.selectedGeofence?.id || 0)
          .subscribe(
            (data) => {
              this.toastService.showErrorToast(
                "Geofence has been deleted successfully"
              );
              this.fetchGeofences();
            },
            (error: any) => {
              this.toastService.showErrorToast(
                "Some Error occured while deleting the geofence"
              );
            }
          );        } else {
          console.log("Dialog was cancelled");
        }
      });
    
    }
  }
  getGeofenceByDeviceId(id: any) {
    this.selectDeviceID = id;
    if (id == 0) {
      this.fetchGeofences();
      return;
    }
    this.geofenceRepo.getGeofenceByDeviceId(id).subscribe(
      (d) => {
        this.mapGeofence = d;
console.log(this.mapGeofence)
        this.geofences.forEach((geofence) => {
          geofence.mappingId = this.mapGeofence.find(
            (mapping: any) => mapping.id === geofence.id
          )?.mappingId;

          geofence.isLinked = this.mapGeofence.some(
            (linked: any) => linked.id === geofence.id
          );
        });
      },
      (e) => {
        this.toastService.errorToast(e);
      },
      () => {}
    );
  }

  onDropDownGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, "contains");
  }

  toggleLinkedItems(itemId: number): void {
    if (this.displayLinkedItems[itemId]) {
      // If already displaying linked items, hide them
      this.displayLinkedItems[itemId] = false;
    } else {
      // If not displaying linked items, fetch and display them
      if (!this.linkedDevices[itemId]) {
        this.loadLinkedDevices(itemId);
      }
      this.displayLinkedItems[itemId] = true;
    }
  }

  loadLinkedDevices(id: number): void {
    if (id === 0) {
      this.getDeviceList();
      return;
    }
    this.geofenceRepo.getlinkedDevices(id).subscribe(
      (d: MappedGeofence[]) => {
        this.linkedDevices[id] = d;
      },
      (e: any) => {
        this.toastService.errorToast(e);
      },
      () => {}
    );
  }
  linkGeofenceToDevice(geofenceId: number, deviceId: [number]) {
    this.geofenceRepo
      .linkGeofence(geofenceId, deviceId)
      .subscribe((data) => {}, this.toastService.errorToast);
  }
  toggleGeofenceLink(
    geofenceId: number,
    isLinked: boolean | undefined,
    mappingId: number
  ) {
    if (isLinked) {
      // Logic to link the geofence
      this.linkGeofenceToDevice(geofenceId, [this.selectDeviceID]);
    } else {
      // Logic to unlink the geofence
      this.unLinkGeofenceFromDevice(mappingId);
    }
  }

  handleCheckboxChange(selectedItem?: Geofence) {
    this.geofences.forEach((geofence) => {
      geofence.isSelected = geofence.id === selectedItem?.id;
    });
    if (this.selectedGeofence === selectedItem) {
      this.selectedGeofence = undefined;
    } else {
      this.selectedGeofence = selectedItem;
    }
  }

  cancel() {
    this.clearGeofenceLayers();
    this.geofenceName = "";
    this.geofenceType = "circle";
    this.button = "Create Geofence";
    this.toggleButton = false;
  }
}
