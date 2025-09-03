import Zoom from "chartjs-plugin-zoom";
import * as L from "leaflet";
import "leaflet.markercluster"
import { VehicleBuilder } from "src/app/vehicleicons/VehicleBuilder";
import { config } from "src/config";
export class MapUtils {
  static  resizeMarker(img:string) {
    return L.icon({iconUrl:img,
      iconSize: [25, 41],
      iconAnchor: [22, 38],
      popupAnchor: [-3, -38]
    })
  }

  static clearClusterMarker(markerClusterGroup:L.MarkerClusterGroup | null) {
    if (markerClusterGroup) {
      markerClusterGroup.clearLayers();
    }
  }

  static drawMarkerOnMap(device:any,onMarkerClick:any) {
    let latLng = L.latLng(device.position?.position?.lat ?? 0.0, device.position?.position?.lng ?? 0.0);
    let markerIcon = new VehicleBuilder().getMarkerIconPath(
      device.device?.vehicleType ?? null,
      device.position?.status?.status ?? null,
      device.position?.details?.vStatus ?? null)
    const marker = L.marker(latLng, {icon: MapUtils.resizeMarker(markerIcon)}).bindPopup(device.device.vehicleNo);
    marker.setRotationAngle(device.position?.heading)
    marker.on("click",() => {
      onMarkerClick()
    })
    return marker
  }
 static clear(map:L.Map,marker:L.Marker,polyline:L.Polyline): void {
    if (marker) {
      map.removeLayer(marker);
    }
    if (polyline) {
      map.removeLayer(polyline);
    }
  }
  static updateMarkerOnMap(marker:L.Marker,device:any) {
    let markerIcon = new VehicleBuilder().getMarkerIconPath(
      device.device?.vehicleType ?? null,
      device.position?.status?.status ?? null,
      device.position?.details?.vStatus ?? null)
    marker.setRotationAngle(device.position?.heading)
    marker.setIcon(this.resizeMarker(markerIcon))
  }

  static initMap(mapId: string,Zoom:number=5):L.Map {
    let  center: L.LatLng = new L.LatLng(20.5937, 78.9629);
    let zoom=Zoom;
    let map =L.map(mapId).setView(center, zoom);
    let options:any = {
      maxZoom: 18,
      minZoom: 3,
      attribution: "©",
    }
    if (!config.currentMap.includes("openstreetmap")) {
      options.subdomains = ["mt0", "mt1", "mt2", "mt3"];
    }
    L.tileLayer(config.currentMap, options).addTo(map);

    return map
  }

  static getMarkerCluster()  {
    return L.markerClusterGroup()
  }

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
