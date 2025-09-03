import * as L from "leaflet";
import "leaflet-rotatedmarker";

import { config } from "src/config";
import { VehicleBuilder } from "src/app/vehicleicons/VehicleBuilder";
import { VehicleTypeFactory } from "src/app/vehicleicons/VehicleFactory";
import { Icon, IconOptions, LatLng, Marker } from "leaflet";

export class SharingMap {
    map!: L.Map;
    private zoom: number = 4;
    private center: L.LatLng = new L.LatLng(20.5937, 78.9629);

    public initMap(mapId: string): void {
        this.map = L.map(mapId).setView(this.center, this.zoom);
        let options:any = {
            maxZoom: 20,
            attribution: "©"
        }
        if (!config.currentMap.includes("openstreetmap")){
            options.subdomains = ["mt0", "mt1", "mt2", "mt3"]
        }
        L.tileLayer(config.currentMap, options).addTo(this.map);
    }

    createCarMarker(
        latLng: LatLng,
        rotationDegrees: number = 90,
        vehicleType: number | undefined = 1,
        status: string,
        subStatus: string,
        data?:any,
        icon?: Icon<IconOptions>,
    ): L.Marker {


 
        const customIcon = L.icon({
            iconUrl: this.getMarkerIcon(vehicleType, status, subStatus),
            iconSize: [20, 30],
            iconAnchor: [10, 15],
            popupAnchor: [0, -32],
        });
        const marker = new Marker<any>(latLng, {
            icon: customIcon,
        });
        marker.setRotationAngle(rotationDegrees);

        if (icon) {
            marker.setIcon(icon);
        }

        marker.on("click", (e) => {
            // Handle marker click event here, if needed
            // You can access additional data passed to the marker here
        });

        // Optionally bind popup if you want
        if (data) {
            this.showInfoWindow(marker, data);
        }

        return marker;
    }

    getMarkerIcon(
        vehicleType: number | undefined,
        status: string,
        subStatus: string
    ): string {
        let vType = VehicleTypeFactory.getInstance(vehicleType);
        let image = new VehicleBuilder().getStatusSubStatus(vType,status, subStatus);
        return "assets/demo/images/vehicles/" + image + ".png";
    }

    showInfoWindow(marker: Marker, data: string): void {
        marker.bindPopup(data);
        marker.openPopup();
    }
    addMarkerOnMap = (marker: Marker) => {
        if (this.map) {
            marker.addTo(this.map);
        } else {
            console.error('Map is not initialized.');
        }
    }  
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
        setCenter = (latLang: LatLng, zoom: number = 10) =>
            this.map.setView(latLang, zoom);
}
