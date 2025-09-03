import { Injectable } from "@angular/core";
import * as L from "leaflet";
import { MapData } from "../helper-map";

@Injectable({
  providedIn: "root",
})
export class VehicleDetailMapperService {
  constructor() {}

  getSummary(points: any[]): any {
    let neverConnectedVehicles = 0,
      runningVehicles = 0,
      stoppedVehicles = 0,
      idleVehicles = 0,
      offlineVehicles = 0;

    const response: MapData[] = [];
    points.forEach((point, i) => {
      const device = point["device"];
      const position = point["position"];
      const valid = point["validity"];

      const data: MapData = {
        device: {
          id: device["id"],
          deviceId: device["deviceId"],
          deviceType: device["deviceType"],
          vehicleType: device["vehicleType"],
          vehicleNo: device["vehicleNo"],
          details: device["details"],
        },
        position: {
          status: position["status"],
          protocol: position["protocol"],
          servertime: position["servertime"],
          deviceTime: position["deviceTime"],
          valid: position["valid"],
          position: new L.LatLng(position["latitude"], position["longitude"]),
          speed: position["speed"],
          heading: position["heading"],
          altitude: position["altitude"],
          accuracy: position["accuracy"],
          details: position["details"],
        },
        validity: {
          installationOn: valid["installationOn"],
          nextRechargeDate: valid["nextRechargeDate"],
          customerRechargeDate: valid["customerRechargeDate"],
        },
      };
      if (
        position.status.status === "Point Expired" ||
        position.status.status === "Offline" ||
        position.status.status === "Customer recharge expired"
      ) {
        offlineVehicles++;
      } else if (position.status.status === "Never Connected") {
        neverConnectedVehicles++;
      } else if (position.status.status === "stop") {
        stoppedVehicles++;
      } else if (position.status.status === "running") {
        runningVehicles++;
      } else if (position.status.status === "dormant") {
        idleVehicles++;
      }

      response.push(data);
    });

    return {
      summary: [
        { count: Number(points.length), color: "grey", description: "All" },
        { count: runningVehicles, color: "green", description: "Running" },
        { count: offlineVehicles, color: "blue", description: "Offline" },
        { count: idleVehicles, color: "orange", description: "Idle" },
        { count: stoppedVehicles, color: "red", description: "Stopped" },
        {
          count: neverConnectedVehicles,
          color: "grey",
          description: "NeverConnected",
        },
      ],
      details: response,
    };
  }
}
