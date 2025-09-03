import { Injectable } from "@angular/core";
import { TrackingLinkService } from "./tracking-link.service";
import { Observable } from "rxjs";
import { CommonUtils } from "src/app/utils/commonUtils";
import { LatLng } from "leaflet";
import { VehicleDetailMapperService } from "src/app/service/vehicle-detail-mapper.service";

import { GeocodingService } from "src/app/service/geocoding.service";
@Injectable()
export class TrackingLinkRepository {
  constructor(
    private summary: VehicleDetailMapperService,
    private trackingLinkService: TrackingLinkService,
    private geoCoder: GeocodingService
  ) {}

    getTrackingDeviceData(id?:string,vehicleNo?:string): Observable<any> {
        return new Observable<any>((observer) => {
            this.trackingLinkService.getTrackingDeviceData(id,vehicleNo).subscribe(
                (data) => {
                    data.position.servertime = this.lastUpDated(
                        new Date().getTime() -
                        new Date(data.position.servertime).getTime()
                    );

                    data.validity.nextRechargeDate = this.nextRechargeDate(
                        new Date(data.validity.nextRechargeDate).getTime() -
                        new Date().getTime()
                    );

                    data.device.details.lastOdometer =
                        ((data.position.details.totalDistance) - CommonUtils.checkUndefined(data.device.details.lastOdometer,0)) / 1000;
                    const latlng = new LatLng(
                        data.position.latitude,
                        data.position.longitude
                    );

                    this.geoCoder
                        .geocode(latlng?.lat ?? 0.0, latlng?.lng ?? 0.0)
                        .subscribe(
                            (d:any) => {
                                const address = d["data"];
                                const result = {data: data, address: address}; // Combine data and address into an object
                                observer.next(result); // Emit the object
                                observer.complete();
                            },
                            (error:any) => {
                                const address = "Location Not Available";
                                const result = {data: data, address: address}; // Combine data and address into an object
                                observer.next(result); // Emit the object
                                observer.complete();
                            }
                        );
                },
                (error) => {
                    observer.error(error); // Emit an error if there's any
                }
            );
        });
    }
  lastUpDated(differenceMs: number): string {
    // Convert milliseconds to seconds
    const differenceSeconds = Math.floor(differenceMs / 1000);

    // Calculate individual units
    const days = Math.floor(differenceSeconds / 86400); // 1 day = 24 * 60 * 60 seconds
    const hours = Math.floor((differenceSeconds % 86400) / 3600);
    const minutes = Math.floor((differenceSeconds % 3600) / 60);
    const seconds = differenceSeconds % 60;

    // Generate the formatted string
    let formattedString = "";
    if (days > 0) {
      formattedString += `${days}day${days > 1 ? "s" : ""} `;
    }
    if (hours > 0) {
      formattedString += `${hours}hr${hours > 1 ? "s" : ""} `;
    }
    if (minutes > 0) {
      formattedString += `${minutes}min${minutes > 1 ? "s" : ""} `;
    }
    if (seconds > 0 || formattedString === "") {
      formattedString += `${seconds}sec${seconds > 1 ? "s" : ""} `;
    }

    formattedString += "ago";

    return formattedString.trim();
  }

  nextRechargeDate(differenceMs: number): string {
    const days = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
    //

    // Format the result into a string
    let result = "";
    if (days > 0) {
      result += `${days} day${days > 1 ? "s" : ""} `;
    }

    return result.trim();
  }
}
