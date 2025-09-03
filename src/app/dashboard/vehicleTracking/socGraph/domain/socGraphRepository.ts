import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GeocodingService } from "src/app/service/geocoding.service";
import { VehicleListService } from "src/app/service/vehicle-list.service";

@Injectable()
export class SocGraphRepository {
  constructor(
    private httpClient: HttpClient,
    private geoCoder: GeocodingService,
    private vehicleListService: VehicleListService
  ) {}

  getSocReportData(
    deviceId: number | undefined,
    startDate: string,
    endDate: string
  ): Observable<{
    socData: number[];
    timestamp: string[];
    averageSocValue: string;
    maxSocValue: number;
    minSocValue: number;
    startAddress: string;
    endAddress: string;
  }> {
    return new Observable((observer) => {
      const subscription = this.vehicleListService
        .getCoordinates(deviceId, startDate, endDate)
        .subscribe(
          (data) => {
            const socData = data.map((object) =>
              parseFloat(object.details.bmsSOC?.toFixed(2))
            ) .filter((value) => !isNaN(value));
            const timestamp = data.map((object) => object.timestamp);

            const averageSocValue = (
              socData.reduce((sum, value) => sum + value, 0) / socData.length
            ).toFixed(2);
            const maxSocValue = Math.max(...socData);
            const minSocValue = Math.min(...socData);

            // Fetch start and end addresses using Promise.all
            Promise.all([
              this.geoCoder.getLocation(data[0].latitude, data[0].longitude),
              this.geoCoder.getLocation(
                data[data.length - 1].latitude,
                data[data.length - 1].longitude
              )
            ])
              .then(([startAddress, endAddress]) => {
                observer.next({
                  socData,
                  timestamp,
                  averageSocValue,
                  maxSocValue,
                  minSocValue,
                  startAddress,
                  endAddress,
                });
                observer.complete();
              })
              .catch((error) => {
                observer.error(error);
              });
          },
          (error) => {
            observer.error(error);
          }
        );
      return () => subscription.unsubscribe();
    });
  }
}
