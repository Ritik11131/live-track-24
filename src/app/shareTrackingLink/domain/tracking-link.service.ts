import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from "src/environments/environment";
import { IconType,icons } from './constants';
@Injectable({
  providedIn: 'root'
})
export class TrackingLinkService {
  constructor(private client: HttpClient) { }

  getTrackingDeviceData(id?:string,vehicleNo?:string): Observable<any> {
    if (vehicleNo != null) {
      return this.client.get(`${environment.url}/api/VehicleList/GetByVehicleNo/${vehicleNo}`).pipe(
          map((res: any) => {
            return res["data"];
          })
      )
    }
    return this.client.get(`${environment.url}/api/VehicleList/Track/${id}`).pipe(
        map((res: any) => {
          return res["data"];
        })
    );

  }


  getShareTrackingPageIcons(
    icon: number,
    type: number | null | undefined | Boolean
  ): string {
    switch (icon) {
      case IconType.POWER:
        return type === true ? icons.engine_on : icons.engine_off;

      case IconType.AC:
        return type === null
          ? icons.ac_null
          : type === 1
          ? icons.ac_on
          : icons.ac_off;
      case IconType.TEMPERATURE:
        return type === null
          ? icons.temperature_null
          : type === 1
          ? icons.temperature_on
          : icons.temperature_off;
      case IconType.DOOR:
        return type === null
          ? icons.door_null
          : type === 1
          ? icons.door_on
          : icons.door_off;
      case IconType.BATTERY:
        return icons.battery;
      case IconType.BATTERYPER:
        return typeof type === "number" && type >= 50
          ? icons.batteryPer_high
          : icons.batteryPer_low;
          case IconType.SOC:
        return typeof type === "number" && type >= 40
          ? icons.soc_high
          : icons.soc_low;
          case IconType.IMMOBILIZER:
            return  type === true
              ? icons.immobilizer_off
              : icons.immobilizer_on;
          case IconType.WHEELLOCK:
            return  type === true
              ? icons.wheelLock_off
              : icons.wheelLock_on;

      case IconType.GPS:
        return type === 1 ? icons.gps_on : icons.gps_off;
      case IconType.SPEED:
        return icons.speed;
      case IconType.DISTANCE:
        return icons.distance;
        case IconType.ODOMETER:
          return icons.odometer;
      default:
        return ""; // Or handle default case as per your requirement
    }
  }
}
