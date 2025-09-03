import * as L from "leaflet";
import "leaflet-rotatedmarker";
import { Icon, IconOptions, LatLng, Marker, LatLngExpression } from "leaflet";
import { VehicleTypeFactory } from "./vehicleicons/VehicleFactory";
import { EventEmitter } from "@angular/core";
import { StopReport } from "./dashboard/report/domain/stopReport.model";
import { VehicleBuilder } from "./vehicleicons/VehicleBuilder";
import { CommonUtils } from "./utils/commonUtils";
import { config } from "../config";
import { GeocodingService } from "./service/geocoding.service";
import { IdleReport } from "./dashboard/report/domain/idleReport.model";

export abstract class HelperMap<T extends MapData> {
  markerMoved = new EventEmitter<number>();
  distanceMoved = new EventEmitter<number>();
  currentPlaybackData = new EventEmitter<string>();
  currentSpeed = new EventEmitter<number>();
  map!: L.Map;
  private isMoving: boolean = false;
  private markerIntervalId: any = null;
  private animationFrameId: number | undefined = undefined;

  marker!: Marker;
  carMarker!: Marker;
  currentIndex = 0;
  reducedLatlngs!: L.LatLng[];
  distance: number = 0;
  private mapId: string = "map";
  private zoom: number = 4;
  timestamp!: string[];
  speedinfo!: number[];
  distanceArray!: number[];
  private center: L.LatLng = new L.LatLng(20.5937, 78.9629);
  private clusterGroup!: L.MarkerClusterGroup;
  private dotMarkers: L.CircleMarker[] = [];
  private markersData = new Map<L.Marker, T>();
  private previousLatLng!: L.LatLng;

  getMarkerIcon(
    vehicleType: number | undefined,
    status: String,
    subStatus: String
  ) {
    let vType = VehicleTypeFactory.getInstance(vehicleType);
    let image = new VehicleBuilder().getStatusSubStatus(
      vType,
      status,
      subStatus
    );
    let icon = "assets/demo/images/vehicles/" + image + ".png";
    return icon;
  }

  protected constructor() {}

  public initMap(): void {
    this.map = L.map(this.mapId).setView(this.center, this.zoom);
    this.clusterGroup = L.markerClusterGroup();
    let options: any = {
      maxZoom: 20,
      attribution: "©",
    };
    if (!config.currentMap.includes("openstreetmap")) {
      options.subdomains = ["mt0", "mt1", "mt2", "mt3"];
    }
    L.tileLayer(config.currentMap, options).addTo(this.map);

    this.map.addLayer(this.clusterGroup);
  }

  createMarker(
    latLng: LatLng,
    type: string,
    address = "",
    startTime = "",
    endTime = "",
    duration = "",
    icon?: Icon<IconOptions>
  ) {
    let iconUrl = "";
    if (type === "Start Location") {
      iconUrl = "assets/demo/images/markers/Start.svg";
    } else if (type === "End Location") {
      iconUrl = "assets/demo/images/markers/End.svg";
    } else if (type === "Stop") {
      iconUrl = "assets/demo/images/markers/Stop.svg";
    } else if (type === "Idle") {
      iconUrl = "assets/demo/images/markers/idle.svg";
    }
    const customIcon = L.icon({
      iconUrl: iconUrl,
      iconSize: [24, 40],
      iconAnchor: [12, 20],
      popupAnchor: [0, -32],
    });
    const marker = new Marker<MapData>(latLng, {
      icon: customIcon,
    });
    if (icon) {
      marker.setIcon(icon);
    }
    // Construct popup content with address, duration, start time, and end time

    let popupContent = "";
    if (type === "Stop") {
      popupContent = `
       <b>${type}</b><br>
       Address: ${address}<br>
       Duration: ${duration}<br>
       Start Time: ${startTime}<br>
       End Time: ${endTime}
    `;
    } else {
      popupContent = `
      <b>${type}</b><br>
      Address: ${address}<br>
    `;
    }
    marker.bindPopup(popupContent); // Bind the popup with the constructed content

    marker.on("click", (e) => {
      const t = this.markersData.get(marker);
      if (t) {
        this.onMarkerClicked(marker, this.markersData.get(marker) as T);
      }
    });
    return marker;
  }

  createTripMarker(
    latLng: LatLng,
    type: string,
    address = "",
    startTime = "",
    endTime = "",
    duration = "",
    icon?: Icon<IconOptions>
  ) {
    let iconUrl = "";
    if (type === "Idle") {
      iconUrl = "assets/demo/images/markers/idle.svg";
    } else if (type === "Stop") {
      iconUrl = "assets/demo/images/markers/Stop.svg";
    }
    const customIcon = L.icon({
      iconUrl: iconUrl,
      iconSize: [24, 40],
      iconAnchor: [12, 20],
      popupAnchor: [0, -32],
    });
    const marker = new Marker<MapData>(latLng, {
      icon: customIcon,
    });
    if (icon) {
      marker.setIcon(icon);
    }
    // Construct popup content with address, duration, start time, and end time

    const popupContent = `<b>${type}</b><br>
       Address: ${address}<br>
       Duration: ${duration}<br>
       Start Time: ${startTime}<br>
       End Time: ${endTime}`;

    marker.bindPopup(popupContent); // Bind the popup with the constructed content

    marker.on("click", (e) => {
      const t = this.markersData.get(marker);
      if (t) {
        this.onMarkerClicked(marker, this.markersData.get(marker) as T);
      }
    });
    return marker;
  }

  createCarMarker(
    latLng: LatLng,
    rotationDegrees: number = 90,
    vehicleType: number | undefined = 1,
    status: String,
    subStatus: String,
    icon?: Icon<IconOptions>
  ): L.Marker {
    const customIcon = L.icon({
      iconUrl: this.getMarkerIcon(vehicleType, status, subStatus),
      iconSize: [25, 45],
      iconAnchor: [10, 15],
      popupAnchor: [0, -32],
    });
    const marker = new Marker<MapData>(latLng, {
      icon: customIcon,
    });
    marker.setRotationAngle(rotationDegrees);

    if (icon) {
      marker.setIcon(icon);
    }

    marker.on("click", (e) => {
      const t = this.markersData.get(marker);
      if (t) {
        this.onMarkerClicked(marker, this.markersData.get(marker) as T);
      }
    });
    return marker;
  }

  async drawPolylineOnMap(
    geoCoder: GeocodingService,
    positions: any[],
    vehicleType: number
  ) {
    if (!this.map) {
      return;
    }
    this.clearMarkersFromMap();
    let latLngs: L.LatLng[] = positions.map((position) =>
      L.latLng(position.latitude, position.longitude)
    );
    this.reducedLatlngs = this.reduceDuplicateLatLng(latLngs);
    // Create polyline
    const polyline = L.polyline(this.reducedLatlngs, { color: "blue" }).addTo(
      this.map
    );
    // Add marker at the start of the polyline
    const startAddress = await geoCoder.getLocation(
      this.reducedLatlngs[0].lat,
      this.reducedLatlngs[0].lng
    );

    const startMarker = this.createMarker(
      this.reducedLatlngs[0],
      "Start Location",
      startAddress
    ); // Create a marker at the first position
    this.addMarkerOnMap(startMarker); // Add the marker to the map
    // // Add marker at the end of the polyline
    const endAddress = await geoCoder.getLocation(
      this.reducedLatlngs[this.reducedLatlngs.length - 1].lat,
      this.reducedLatlngs[this.reducedLatlngs.length - 1].lng
    );

    const endMarker = this.createMarker(
      this.reducedLatlngs[this.reducedLatlngs.length - 1],
      "End Location",
      endAddress
    ); // Create a marker at the last position
    this.addMarkerOnMap(endMarker); // Add the marker to the map
    this.carMarker = this.createCarMarker(
      this.reducedLatlngs[0],
      90,
      vehicleType,
      "running",
      "running"
    ); // Create a marker at the first position
    this.addMarkerOnMap(this.carMarker);
    // Fit map bounds to include the polyline and markers
    const bounds = L.latLngBounds(this.reducedLatlngs);
    // bounds.extend(startMarker.getLatLng());
    // bounds.extend(endMarker.getLatLng());
    this.map.fitBounds(bounds);
  }

  clearPolylineFromMap() {
    this.map.eachLayer((layer) => {
      if (
        layer instanceof L.Polyline ||
        layer instanceof L.Marker ||
        layer instanceof L.CircleMarker
      ) {
        this.map.removeLayer(layer);
      }
    });
    this.stopMarkerMovement();
    this.dotMarkers = [];
    this.currentIndex = 0;
  }

  clearMarkersFromMap() {
    if (this.map) {
      // Clear all markers from the map
      this.map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          this.map.removeLayer(layer);
        }
      });
    } else {
      console.error("Map is not initialized.");
    }
  }

  async createStopMarker(
    geocoder: GeocodingService,
    position: StopReport,
    type: string
  ) {
    const { duration, dormantStart, dormantEnd, latitude, longitude } =
      position;
    const latlng = L.latLng(latitude, longitude);
    const address = await geocoder.getLocation(latlng.lat, latlng.lng);
    const stopmarker = this.createTripMarker(
      latlng,
      type,
      address,
      dormantStart,
      dormantEnd,
      duration
    );
    this.addMarkerOnMap(stopmarker);
    stopmarker.openPopup();
  }

  // Inside HelperMap class
  createStopMarkers(geocoder: GeocodingService, positions: StopReport[]) {
    positions.slice(1).forEach(async (pos) => {
      const { duration, dormantStart, dormantEnd, latitude, longitude } = pos;
      const latlng = L.latLng(latitude, longitude);
      const address = await geocoder.getLocation(latlng.lat, latlng.lng);
      const stopmarker = this.createMarker(
        latlng,
        "Stop",
        address,
        dormantStart,
        dormantEnd,
        duration
      );
      this.addMarkerOnMap(stopmarker);
    });
  }

  clearStopMarkers(positions: StopReport[]) {
    let latLngs: L.LatLng[] = positions.map((position) =>
      L.latLng(position.latitude, position.longitude)
    );
    latLngs = this.reduceDuplicateLatLng(latLngs);
    latLngs.slice(1).forEach((coord) => {
      this.map.eachLayer((layer) => {
        if (layer instanceof Marker) {
          const marker = layer as Marker;
          const markerLatLng = marker.getLatLng();
          if (
            markerLatLng.lat === coord.lat &&
            markerLatLng.lng === coord.lng
          ) {
            this.map.removeLayer(marker);
            this.markersData.delete(marker);
          }
        }
      });
    });
  }

  createIdleMarkers(geocoder: GeocodingService, positions: IdleReport[]) {
    positions.slice(1).forEach(async (pos) => {
      const { duration, dormantStart, dormantEnd, latitude, longitude } = pos;
      const latlng = L.latLng(latitude, longitude);
      const address = await geocoder.getLocation(latlng.lat, latlng.lng);
      const idlemarker = this.createMarker(
        latlng,
        "Idle",
        address,
        dormantStart,
        dormantEnd,
        duration
      );
      this.addMarkerOnMap(idlemarker);
    });
  }

  clearIdleMarkers(positions: IdleReport[]) {
    let latLngs: L.LatLng[] = positions.map((position) =>
      L.latLng(position.latitude, position.longitude)
    );
    latLngs = this.reduceDuplicateLatLng(latLngs);
    latLngs.slice(1).forEach((coord) => {
      this.map.eachLayer((layer) => {
        if (layer instanceof Marker) {
          const marker = layer as Marker;
          const markerLatLng = marker.getLatLng();
          if (
            markerLatLng.lat === coord.lat &&
            markerLatLng.lng === coord.lng
          ) {
            this.map.removeLayer(marker);
            this.markersData.delete(marker);
          }
        }
      }); 
    });
  }

  reduceDuplicatePositions(positions: any[]): any[] {
    let previous: any | null = null;
    const reducedPositions: LatLng[] = [];
    positions.forEach((item, i) => {
      if (!previous) {
        previous = item;
        reducedPositions.push(item);
      } else {
        if (
          previous.latitude !== item.latitude ||
          previous.longitude !== item.longitude
        ) {
          reducedPositions.push(item);
        }
      }
      previous = item;
    });
    return reducedPositions;
  }

  reduceDuplicateLatLng(positions: LatLng[]): LatLng[] {
    let previous: LatLng | null = null;
    const reducedPositions: LatLng[] = [];
    positions.forEach((item, i) => {
      if (!previous) {
        previous = item;
        reducedPositions.push(item);
      } else {
        if (previous.lat !== item.lat || previous.lng !== item.lng) {
          reducedPositions.push(item);
        }
      }
      previous = item;
    });
    return reducedPositions;
  }

  isMarkerMoving(): boolean {
    return this.isMoving;
  }

  moveMarkerAlongPolyline(allPosition: any[], seekbarValue: number) {
    const newPositionIndex = Math.floor(
      seekbarValue * this.reducedLatlngs.length
    );
    let position = this.reduceDuplicatePositions(allPosition).map((position) =>
      L.latLng(position.latitude, position.longitude)
    );
    this.distanceMoved.emit(
      this.calculateTotalDistance(this.distanceArray, newPositionIndex)
    );

    // Update the current speed based on the seekbar value
    this.currentSpeed.emit(this.speedinfo[newPositionIndex]);
    this.currentPlaybackData.emit(this.timestamp[newPositionIndex]);

    // Remove circular dots ahead of the marker if moving backward
    if (newPositionIndex < this.currentIndex) {
      for (let i = this.currentIndex; i < this.dotMarkers.length; i++) {
        this.map.removeLayer(this.dotMarkers[i]);
      }
      // Update currentIndex to the new position index
      this.currentIndex = newPositionIndex;
    }
    //add green dots
    if (newPositionIndex > this.currentIndex) {
      for (let i = this.currentIndex; i < newPositionIndex; i++) {
        const dotMarker = this.addCircleDots(position[i]);
        this.dotMarkers.push(dotMarker); // Store reference to the dot marker
      }
    }
    // Update the marker position if the new index is within the positions array bounds
    if (
      newPositionIndex >= 0 &&
      newPositionIndex < this.reducedLatlngs.length
    ) {
      this.currentIndex = newPositionIndex; // Set the currentIndex to the newPositionIndex

      // Move the marker to the new position
      const newPosition = this.reducedLatlngs[this.currentIndex];
      this.carMarker.setLatLng(newPosition);
      this.map?.panTo(newPosition);
    }
  }

  calculateTotalDistance(distances: number[], index: number): number {
    // Check if the index is valid
    if (index < 0 || index >= distances.length) {
      throw new Error("Index out of bounds");
    }

    let sum = 0;
    sum = (this.distanceArray[index] - this.distanceArray[0]) / 1000;
    return sum;
  }

  reStartMovement(position: any[], speed: number = 700) {
    this.distance = 0; // Reset to loop through the polyline
    // Clear all dots from the map
    this.dotMarkers.forEach((dotMarker) => {
      this.map.removeLayer(dotMarker);
    });
    this.dotMarkers = [];
    this.currentIndex = 0;
    this.changeMarkerSpeed(position, speed);
  }

  startMarkerMovement(allPosition: any[], speed: number = 700) {
    let position = this.reduceDuplicatePositions(allPosition);
    let newPosition;
    this.timestamp = position.map((data) => data.timestamp);
    this.speedinfo = position.map((data) => data.speed);
    let positions: L.LatLng[] = position.map((position) =>
      L.latLng(position.latitude, position.longitude)
    );
    this.distanceArray = position.map((data) => data.details.totalDistance);

    this.isMoving = true;
    this.markerIntervalId = setInterval(() => {
      if (this.currentIndex < positions.length) {
        newPosition = positions[this.currentIndex];
        if (this.previousLatLng == null) {
          this.previousLatLng = newPosition;
          this.currentIndex += 1;
          newPosition = positions[this.currentIndex];
        } else {
          this.previousLatLng = positions[this.currentIndex - 1];
          newPosition = positions[this.currentIndex];
        }
        // this.carMarker.setLatLng(newPosition);
        this.animateMarker(newPosition, speed);
        // Add a small green dot at the current position
        const dotMarker = this.addCircleDots(newPosition);
        this.dotMarkers.push(dotMarker); // Store reference to the dot marker
        this.carMarker.setRotationAngle(
          this.getBearing(this.previousLatLng, newPosition)
        );
        this.map?.panTo(newPosition);
        this.markerMoved.emit(
          (this.currentIndex / (positions.length - 1)) * 100
        );
        this.distance = parseFloat(
          (
            (this.distanceArray[this.currentIndex] - this.distanceArray[0]) /
            1000
          ).toFixed(3)
        );
        this.distanceMoved.emit(this.distance);
        this.currentPlaybackData.emit(this.timestamp[this.currentIndex]);
        this.currentSpeed.emit(this.speedinfo[this.currentIndex]);

        this.currentIndex++;
      } else {
        clearInterval(this.markerIntervalId);
        this.currentIndex = 0;
        this.distance = 0; // Reset to loop through the polyline
      }
    }, speed);
  }

  addCircleDots(newPosition: L.LatLng): L.CircleMarker {
    const dot = L.circleMarker(newPosition, {
      color: "green",
      fillColor: "green",
      fillOpacity: 1,
      radius: 3, // Adjust the size of the dot as needed
    }).addTo(this.map);
    return dot;
  }

  animateMarker(newPosition: L.LatLng, speed: number): void {
    const steps = 100;
    const duration = speed; // Duration of movement in milliseconds
    const latStep = (newPosition.lat - this.previousLatLng.lat) / steps;
    const lngStep = (newPosition.lng - this.previousLatLng.lng) / steps;
    let currentStep = 0;
    const startTime = performance.now();

    const animate = (currentTime: any) => {
      const elapsedTime = currentTime - startTime;
      currentStep = Math.min((elapsedTime / duration) * steps, steps);

      if (currentStep < steps) {
        const currentLat = this.previousLatLng.lat + latStep * currentStep;
        const currentLng = this.previousLatLng.lng + lngStep * currentStep;
        this.carMarker.setLatLng(L.latLng(currentLat, currentLng));
        requestAnimationFrame(animate);
      } else {
        this.carMarker.setLatLng(newPosition); // Ensure it ends exactly at newPosition
      }
    };

    requestAnimationFrame(animate);
  }

  // Function to calculate the angle of location
  getBearing(startLatLng: L.LatLng, endLatLng: L.LatLng): number {
    const startLat = this.toRadians(startLatLng.lat);
    const startLng = this.toRadians(startLatLng.lng);
    const endLat = this.toRadians(endLatLng.lat);
    const endLng = this.toRadians(endLatLng.lng);
    const dLng = endLng - startLng;
    const y = Math.sin(dLng) * Math.cos(endLat);
    const x =
      Math.cos(startLat) * Math.sin(endLat) -
      Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);
    let bearing = Math.atan2(y, x);
    bearing = this.toDegrees(bearing);
    bearing = (bearing + 360) % 360;
    return bearing;
  }

  // Function to convert degrees to radians
  toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  // Function to convert radians to degrees
  toDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
  }

  stopMarkerMovement() {
    clearInterval(this.markerIntervalId);
    this.isMoving = false;
  }

  // Add a method to start and adjust the movement speed of the marker
  changeMarkerSpeed(position: any[], speed: number) {
    clearInterval(this.markerIntervalId); // Clear the previous interval
    this.startMarkerMovement(position, speed); // Start the movement with the new speed
  }

  setMarkerCustomData = (marker: L.Marker, data: T) =>
    this.markersData.set(marker, data);
  setMarkerInMarkerCluster = (marker: Marker) =>
    this.clusterGroup.addLayer(marker);

  clearClusterGroup = () => {
    if (this.clusterGroup) {
      this.clusterGroup.clearLayers();
    }
  };

  addMarkerOnMap = (marker: Marker) => marker.addTo(this.map);
  invalidateMap = () => this.map.invalidateSize();
  setZoom = (zoom: number) => this.map.setZoom(zoom);
  setCenter = (latLang: LatLng, zoom: number = 10) =>
    this.map.setView(latLang, zoom);

  getMap = () => this.map;
  getZoom = () => this.map.getZoom();

  fitMarkerClusterBounds = () =>
    this.map.fitBounds(this.clusterGroup.getBounds(), {
      animate: true,
      padding: [20, 20],
    });

  showInfoWindow(marker: Marker, data: string): void {
    marker.bindPopup(data);
    marker.openPopup();
  }

  clearMarkerCluster(): void {
    this.clusterGroup.clearLayers();
  }

  removeMarker(marker: L.Marker): void {
    if (marker && '_leaflet_id' in marker) {
       this.map.removeLayer(marker);
    } else {
       console.error('Marker is undefined or invalid:', marker);
    }
 }
 
  abstract onMarkerClicked(marker: Marker, data: T): void;

  // sir code
  drawMarkerOnMap(device: any, onMarkerClick: any) {
    let latLng = L.latLng(
      device.position?.position?.lat ?? 0.0,
      device.position?.position?.lng ?? 0.0
    );
    let markerIcon = new VehicleBuilder().getMarkerIconPath(
      device.device?.vehicleType ?? null,
      device.position?.status?.status ?? null,
      device.position?.details?.vStatus ?? null
    );
    const marker = L.marker(latLng, {
      icon: this.resizeMarker(markerIcon),
    }).bindPopup(device.device.vehicleNo);
    marker.setRotationAngle(device.position?.heading);
    marker.on("click", () => {
      onMarkerClick();
    });
    return marker;
  }

  updateMarkerOnMap(marker: L.Marker, device: any) {
    let markerIcon = new VehicleBuilder().getMarkerIconPath(
      device.device?.vehicleType ?? null,
      device.position?.status?.status ?? null,
      device.position?.details?.vStatus ?? null
    );
    marker.setRotationAngle(device.position?.heading);
    marker.setIcon(this.resizeMarker(markerIcon));
  }
  resizeMarker(img: string) {
    console.log(img);

    return L.icon({
      iconUrl: img,
      iconSize: [25, 41],
      iconAnchor: [22, 38],
      popupAnchor: [-3, -38],
    });
  }
  // sir code
}

export interface MapData {
  device: Device;
  position: PositionData;
  validity: Validity;
}

export interface Device {
  id: number;
  deviceId: string;
  vehicleType: number;
  vehicleNo: string;
  deviceType: number;
  details: any;
}

export interface PositionData {
  status: Status;
  protocol: string;
  servertime: string;
  deviceTime: string;
  valid: number;
  position: L.LatLng;
  speed: number;
  heading: number;
  altitude: number;
  accuracy: number;
  details: any;
}

export interface Validity {
  installationOn: string;
  nextRechargeDate: string;
  customerRechargeDate: string;
}

export interface Status {
  status: string;
  duration: string;
}
