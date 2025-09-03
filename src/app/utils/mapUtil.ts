import * as L from "leaflet";
import "leaflet-draw";
import { Subject } from "rxjs";
import { LatLngExpression } from "leaflet";

export class MapUtils {
  map!: L.Map;
  drawnItems!: L.FeatureGroup;
  radiusSubject!: Subject<number>;
  currentCircle: L.Circle | undefined;
  currentPolygon: L.Polygon | undefined;
  currentPolyline: L.Polyline | undefined;
  marker!: L.Marker | undefined;
  addedPolygonPoints: L.LatLng[] = [];
  addedRoutePoints: L.LatLng[] = [];
  private mapId: string = "map2";
  coordinates: L.LatLngExpression[] = [];
  createCustomMarker(map: L.Map, position: L.LatLng): L.Marker {
    const customIcon = L.icon({
      iconUrl: "assets/geofence.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
    const marker = L.marker(position, { icon: customIcon }).addTo(map);
    return marker;
  }
  initMap(): void {
    this.map = L.map(this.mapId ).setView([51.505, -0.09], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
    this.drawnItems = new L.FeatureGroup();
    this.map.addLayer(this.drawnItems);

  }
 
  createCircle(center: L.LatLngExpression, radius: number): L.Circle {
    const circle = L.circle(center, { radius: radius }).addTo(this.map);
    this.drawnItems.addLayer(circle);
    return circle;
  }
  createCircleOnMapClick(defaultRadius: number): void {
    this.removeExistingGeofences();
    this.radiusSubject = new Subject<number>();
    this.map.on("click", (event: L.LeafletMouseEvent) => {
      const center = event.latlng;
      if (this.currentCircle) {
        this.map.removeLayer(this.currentCircle);
      }
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
      this.currentCircle = this.createCircle(center, defaultRadius);
      this.marker = this.createCustomMarker(this.map, center);
      this.radiusSubject.subscribe((radius: number) => {
        if (this.currentCircle) {
          this.currentCircle.setRadius(radius * 1000);
        }
      });
    });
  }
  setCircleRadius(radius: number): void {
    if (this.currentCircle) {
      this.currentCircle.setRadius(radius * 1000);
    }
  }
  createRoute(): L.Polyline | undefined {
    this.removeExistingGeofences();
    let startMarker: L.Marker;
    let endMarker: L.Marker;
    const addPointToRoute = (event: L.LeafletMouseEvent): void => {
      const clickedPoint = event.latlng;
      this.coordinates.push(event.latlng);
      this.addedRoutePoints.push(event.latlng);
      if (this.currentPolyline) {
        this.drawnItems.removeLayer(this.currentPolyline);
      }
      if (endMarker) {
        this.map.removeLayer(endMarker);
      }
      this.currentPolyline = L.polyline(this.coordinates).addTo(this.map);
      this.drawnItems.addLayer(this.currentPolyline);

      if (this.coordinates.length === 1) {
        startMarker = this.createCustomMarker(this.map, clickedPoint);
      }
      endMarker = this.createCustomMarker(this.map, clickedPoint);
    };
    const endRouteCreation = (event: L.LeafletMouseEvent): void => {
      if (this.coordinates.length >= 2) {
        this.map.off("click", addPointToRoute);
        this.map.off("dblclick", endRouteCreation);
      } else {
        console.log("You need at least two points to create a route.");
      }
    };
    this.map.on("click", addPointToRoute);
    // Attach the double-click event listener to end polygon creation
    this.map.on("dblclick", endRouteCreation);
    return this.currentPolyline;
  }
  createPolygon(): L.Polygon | undefined {
    this.removeExistingGeofences();
    let markers: L.Marker[] = [];
    const addPointToPolygon = (event: L.LeafletMouseEvent): void => {
      this.coordinates.push(event.latlng);
      this.addedPolygonPoints.push(event.latlng);
      if (this.currentPolygon) {
        this.drawnItems.removeLayer(this.currentPolygon);
      }
      this.currentPolygon = L.polygon(this.coordinates).addTo(this.map);
      this.drawnItems.addLayer(this.currentPolygon);
      this.coordinates.forEach((coordinate) => {
        const marker = this.createCustomMarker(
          this.map,
          coordinate as L.LatLng
        );
        markers.push(marker);
      });
    };
    const endPolygonCreation = (event: L.LeafletMouseEvent): void => {
      if (this.coordinates.length > 2) {
        this.map.off("click", addPointToPolygon);
        this.map.off("dblclick", endPolygonCreation);
      } else {
        console.log("You need at least three points to create a polygon.");
      }
    };
    this.map.on("dblclick", endPolygonCreation);
    this.map.on("click", addPointToPolygon);
    return this.currentPolygon;
  }
  editGeoFence(): void {
    const editControl = new L.Control.Draw({
      edit: {
        featureGroup: this.drawnItems,
      },
    });
    this.map.addControl(editControl);
  }
  deleteGeoFence(): void {
    this.map.removeLayer(this.drawnItems);
  }
  collectGeofenceInformation(): any[] {
    const geofences: any[] = [];
    if (this.currentCircle) {
      const geofenceInfo = {
        id: L.stamp(this.currentCircle),
        type: "Circle",
        center: this.currentCircle?.getLatLng(),
        radius: this.currentCircle?.getRadius(),
      };
      geofences.push(geofenceInfo);
    } else if (this.currentPolygon) {
      const latLngs = this.currentPolygon.getLatLngs() as L.LatLng[][];
      const coordinates: L.LatLngExpression[] = latLngs[0].map(
        (latLng: L.LatLng) => [latLng.lat, latLng.lng]
      );
      const geofenceInfo = {
        id: L.stamp(this.currentPolygon),
        type: "Polygon",
        coordinates: coordinates,
      };
      geofences.push(geofenceInfo);
    } else if (this.currentPolyline) {
      const latLngs = this.currentPolyline?.getLatLngs() as L.LatLng[];
      const coordinates: L.LatLngExpression[] = latLngs.map(
        (latLng: L.LatLng) => [latLng.lat, latLng.lng]
      );
      const geofenceInfo = {
        id: L.stamp(this.currentPolyline),
        type: "Polyline",
        coordinates: coordinates,
      };
      geofences.push(geofenceInfo);
    }
    this.removeExistingGeofences();
    return geofences;
  }
  removeExistingGeofences(): void {
    this.map.eachLayer((layer: L.Layer) => {
      if (!(layer instanceof L.TileLayer)) {
        this.map.removeLayer(layer);
      }
    });
    this.drawnItems.clearLayers();
    this.map.off("click");
    this.map.off("dblclick");
    this.currentCircle = undefined;
    this.currentPolygon = undefined;
    this.currentPolyline = undefined;
    this.coordinates = [];
    this.marker = undefined;
    this.drawnItems.addTo(this.map);
  }
  showGeofences(geofence: any): void {
    this.removeExistingGeofences();
    if (geofence.type === "Circle") {
      this.currentCircle = L.circle(geofence.center, {
        radius: geofence.radius,
      }).addTo(this.map);
      this.editCircle(geofence.center, geofence.radius);
    } else if (geofence.type === "Polygon") {
      this.currentPolygon = L.polygon(geofence.coordinates).addTo(this.map);
      this.editPolygon(geofence.coordinates);
    } else if (geofence.type === "Polyline") {
      this.currentPolyline = L.polyline(geofence.coordinates).addTo(this.map);
      this.editRoute(geofence.coordinates);
    }
  }
  editPolygon(allCoordinates: L.LatLngExpression[]): void {
    this.removeExistingGeofences();
    this.coordinates = allCoordinates;
    let markers: L.Marker[] = [];
    this.coordinates.forEach((coordinate) => {
      const marker = this.createCustomMarker(this.map, L.latLng(coordinate));
      markers.push(marker);
    });
    if (this.currentPolygon) {
      this.drawnItems.removeLayer(this.currentPolygon);
    }
    this.currentPolygon = L.polygon(this.coordinates).addTo(this.map);
    this.drawnItems.addLayer(this.currentPolygon);
    const addPointToPolygon = (event: L.LeafletMouseEvent): void => {
      const clickedPoint = event.latlng;
      this.coordinates.push([clickedPoint.lat, clickedPoint.lng]);
      if (this.currentPolygon) {
        this.drawnItems.removeLayer(this.currentPolygon);
      }
      this.currentPolygon = L.polygon(this.coordinates).addTo(this.map);
      this.drawnItems.addLayer(this.currentPolygon);
      this.coordinates.forEach((coordinate) => {
        const marker = this.createCustomMarker(this.map, L.latLng(coordinate));
        markers.push(marker);
      });
    };
    this.map.off("click", addPointToPolygon);
    this.map.on("click", addPointToPolygon);
  }
  editRoute(allCoordinates: L.LatLngExpression[]): void {
    this.coordinates = allCoordinates;
    let startMarker: L.Marker | undefined;
    let endMarker: L.Marker | undefined;
    this.currentPolyline = L.polyline(this.coordinates).addTo(this.map);
    this.drawnItems.addLayer(this.currentPolyline);
    startMarker = this.createCustomMarker(this.map, L.latLng(this.coordinates[0]));
    endMarker = this.createCustomMarker(
      this.map,
      L.latLng(this.coordinates[this.coordinates.length - 1])
    );
    const addPointToRoute = (event: L.LeafletMouseEvent): void => {
      const clickedPoint = event.latlng;
      this.coordinates.push( event.latlng);
      if (this.currentPolyline) {
        this.drawnItems.removeLayer(this.currentPolyline);
      }
      this.currentPolyline = L.polyline(this.coordinates).addTo(this.map);
      this.drawnItems.addLayer(this.currentPolyline);
      if (endMarker) {
        this.map.removeLayer(endMarker);
      }
      endMarker = this.createCustomMarker(this.map, clickedPoint);
    };

    this.map.on("click", addPointToRoute);
  }
  editCircle(center: L.LatLng, radius: number) {
    this.radiusSubject = new Subject<number>();
    this.marker = this.createCustomMarker(this.map, center);
    this.map.on("click", (event: L.LeafletMouseEvent) => {
      const center = event.latlng;
      if (this.currentCircle) {
        this.map.removeLayer(this.currentCircle);
      }
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
      this.currentCircle = this.createCircle(center, radius);
      this.marker = this.createCustomMarker(this.map, center);
      this.radiusSubject.subscribe((radius: number) => {
        if (this.currentCircle) {
          this.currentCircle.setRadius(radius * 1000);
        }
      });
    });
  }
  updateGeofence(geofence: any) {
    const geofences: any[] = [];
    if (this.currentCircle) {
      const geofenceInfo = {
        id: geofence.id,
        type: "Circle",
        center: this.currentCircle?.getLatLng(),
        radius: this.currentCircle?.getRadius(),
      };
      geofences.push(geofenceInfo);
    } else if (this.currentPolygon) {
      const latLngs = this.currentPolygon.getLatLngs() as L.LatLng[][];
      const coordinates: L.LatLngExpression[] = latLngs[0].map(
        (latLng: L.LatLng) => [latLng.lat, latLng.lng]
      );
      const geofenceInfo = {
        id: geofence.id,
        type: "Polygon",
        coordinates: coordinates,
      };
      geofences.push(geofenceInfo);
    } else if (this.currentPolyline) {
      const latLngs = this.currentPolyline.getLatLngs() as L.LatLng[];
      const coordinates: L.LatLngExpression[] = latLngs.map(
        (latLng: L.LatLng) => [latLng.lat, latLng.lng]
      );
      const geofenceInfo = {
        id: geofence.id,
        type: "Polyline",
        coordinates: coordinates,
      };
      geofences.push(geofenceInfo);
    }
    this.removeExistingGeofences();
    return geofences;
  }

  undoGeofence(): void {
    if (this.currentPolygon) {
      this.addedPolygonPoints.pop();
      const ss = this.coordinates.pop();
      this.removeMarkerByLatLng(ss as L.LatLng);
      this.redrawPolygon();
    } else if (this.currentPolyline) {
      this.addedRoutePoints.pop();
      const ss = this.coordinates.pop();
      this.removeMarkerByLatLng(ss as L.LatLng);

      this.redrawRoute();
    }
  }
  removeMarkerByLatLng(coordinate: L.LatLng): void {
    this.map.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Marker) {
        const marker = layer as L.Marker;
        const markerLatLng = marker.getLatLng();

        if (
          markerLatLng.lat === coordinate.lat &&
          markerLatLng.lng === coordinate.lng
        ) {
          this.map.removeLayer(marker);
        }
      }
    });
  }

  redrawPolygon(): void {
    if (this.currentPolygon) {
      this.drawnItems.removeLayer(this.currentPolygon);
    }
    this.currentPolygon = L.polygon(this.coordinates).addTo(this.map);
    this.drawnItems.addLayer(this.currentPolygon);
  }

  redrawRoute(): void {
 
    if (this.currentPolyline) {
      this.drawnItems.removeLayer(this.currentPolyline);
    }
    this.currentPolyline = L.polyline(this.coordinates).addTo(this.map);
    this.drawnItems.addLayer(this.currentPolyline);
  }
}
