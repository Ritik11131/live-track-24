import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GeocodingService } from "src/app/service/geocoding.service";
import { VehicleListService } from "src/app/service/vehicle-list.service";

@Injectable()
export class TempAnalysisRepository {
  constructor(
    private httpClient: HttpClient,
    private geoCoder: GeocodingService,
    private vehicleListService: VehicleListService
  ) {}

  getTempReportData(
    deviceId: number | undefined,
    startDate: string,
    endDate: string
  ): Observable<{
    tempData: number[];
    timestamp: string[];
    averageTempValue: string;
    maxTempValue: number;
    minTempValue: number;
    startAddress: string;
    endAddress: string;
  }> {
    return new Observable((observer) => {
      const subscription = this.vehicleListService
        .getCoordinates(deviceId, startDate, endDate)
        .subscribe(
          (data) => {
            // Filter out undefined or NaN values
            const tempData = data
              .map((object) => parseFloat(object.details.temp?.toFixed(2)))
              .filter((value) => !isNaN(value));
  
            const timestamp = data.map((object) => object.timestamp);
  
            if (tempData.length === 0) {
              observer.error(new Error("No valid temperature data available"));
              return;
            }
  
            const averageTempValue = (
              tempData.reduce((sum, value) => sum + value, 0) / tempData.length
            ).toFixed(2);
  
            const maxTempValue = Math.max(...tempData);
            const minTempValue = Math.min(...tempData);
  
            console.log(minTempValue, maxTempValue, averageTempValue);
  
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
                  tempData,
                  timestamp,
                  averageTempValue,
                  maxTempValue,
                  minTempValue,
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
