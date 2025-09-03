import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { forkJoin, from, map, Observable, of, pipe } from "rxjs";
import { environment } from "../../../../environments/environment";
import { concatMap, catchError, toArray } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ReportService {
  constructor(private client: HttpClient) {}

  getVehicleStopData(
    DeviceId: number,
    FromTime: string,
    ToTime: string
  ): Observable<any> {
    const payload = {
      DeviceId: DeviceId,
      FromTime: FromTime,
      ToTime: ToTime,
    };
    return this.client
      .post<any>(`${environment.url}/api/reports/StopReport`, payload)
      .pipe(
        catchError((error: any) => {
          console.error("Error occurred:", error);
          return of([]); // Return an empty array in case of error
        })
      );
  }
  getOverSpeedReportData(
    DeviceId: number,
    FromTime: string,
    ToTime: string,
    SpeedLimit: number
  ): Observable<any> {
    const payload = {
      DeviceId: DeviceId,
      FromTime: FromTime,
      ToTime: ToTime,
      SpeedLimit: SpeedLimit,
    };
    return this.client
      .post<any>(`${environment.url}/api/reports/OverspeedReport`, payload)
      .pipe(
        catchError((error: any) => {
          console.error("Error occurred:", error);
          return of([]); // Return an empty array in case of error
        })
      );
  }
  getVehicleIdleData(
    DeviceId: number,
    FromTime: string,
    ToTime: string
  ): Observable<any> {
    const payload = {
      DeviceId: DeviceId,
      FromTime: FromTime,
      ToTime: ToTime,
    };
    return this.client
      .post<any>(`${environment.url}/api/reports/IdleReport`, payload)
      .pipe(
        catchError((error: any) => {
          console.error("Error occurred:", error);
          return of([]); // Return an empty array in case of error
        })
      );
  }

  getMultipleVehicleDistanceData(
    deviceIds: number[],
    fromDate: string,
    toDate: string
  ): Observable<any[]> {
    const observables = deviceIds.map((deviceId) => 
      this.getVehicleDistanceData(deviceId, fromDate, toDate).pipe(
        map((response) => {
          if (response.data && response.data.length > 0) {
            const data = response.data;
            const vehicleNo = data[0].vehicleNo;
            const firstDate = data[0].dateDis;
            const lastDate = data[data.length - 1].dateDis;
            const totalDistance = data.reduce((sum: number, record: any) => {
              return sum + (record.distance || 0);
            }, 0);
  
            return {
              vehicleNo: vehicleNo,
              firstDate: firstDate,
              lastDate: lastDate,
              totalDistance: totalDistance,
            };
          } else {
            return null; // Handle the case where data is empty or null
          }
        })
      )
    );
  
    return forkJoin(observables).pipe(
      map((results) => results.filter(result => result !== null)) // Filter out null results
    );
  }
  
  getVehicleDistanceData(
    DeviceId: number,
    FromDate: string,
    ToDate: string
  ): Observable<any> {
    const payload = {
      DeviceId: DeviceId,
      FromDate: FromDate,
      ToDate: ToDate,
    };
    return this.client
      .post<any>(`${environment.url}/api/reports/DistanceReport`, payload)
      .pipe(
        catchError((error: any) => {
          console.error("Error occurred:", error);
          return of([]); // Return an empty array in case of error
        })
      );
  }
  
  getVehicleTripData(
    DeviceId: number | undefined,
    FromTime: string,
    ToTime: string
  ): Observable<any> {
    const payload = {
      DeviceId: DeviceId,
      FromTime: FromTime,
      ToTime: ToTime,
    };
    return this.client
      .post<any>(`${environment.url}/api/reports/TripReport`, payload)
      .pipe(
        catchError((error: any) => {
          console.error("Error occurred:", error);
          return of([]); // Return an empty array in case of error
        })
      );
  }


  getReportData(
    deviceId: number,
    startDate: string,
    endDate: string,
    reportType: string,
    speed: number = 0
): Observable<any[]> {
    // Initialize requests as an empty observable
    let requests: Observable<any[]> = of([]);
    const separator = startDate.includes("T") ? "T" : " ";
    const timeZoneMatch = startDate.match(/([-+]\d{2}:\d{2})$/);
    const timeZone = timeZoneMatch ? timeZoneMatch[0] : "+00:00";
    // Loop through each day between the start and end dates
    for (
        let currentDay = new Date(startDate);
        currentDay <= new Date(endDate);
        currentDay.setDate(currentDay.getDate() + 1)
    ) {
        let currentStartDate: Date;
        let currentEndDate: Date;
        if (new Date(startDate).toISOString().split('T')[0]===new Date(endDate).toISOString().split('T')[0]){
            currentStartDate = new Date(currentDay);
            currentEndDate = new Date(endDate);
        }else{
            currentStartDate = new Date(currentDay);
            currentEndDate = new Date(currentStartDate);
        }







        // For the first date, adjust the start time if provided
        if (
            this.formatDate(currentStartDate, separator, timeZone) === startDate
        ) {
            const startTime = startDate.split(separator)[1].split("+")[0];
            const [hours, minutes, seconds] = startTime
                .split(":")
                .map((part) => parseInt(part));
            currentStartDate.setHours(hours, minutes, seconds);
        } else {
            // For other dates, set start time to 00:00:00
            currentStartDate.setHours(0, 0, 0);
        }
        // For the last date, use the provided end time
        if (this.formatDate(currentEndDate, separator, timeZone) === endDate) {
            const endTime = endDate.split(separator)[1].split("+")[0];
            const [hours, minutes, seconds] = endTime
                .split(":")
                .map((part) => parseInt(part));
            currentEndDate.setHours(hours, minutes, seconds);
        } else {
            // For other dates, set end time to 23:59:59
            currentEndDate.setHours(23, 59, 59);
        }

        // Format date strings in the required format (YYYY-MM-DD HH:mm:ss)
        const formattedStartDate = this.formatDate(
            currentStartDate,
            separator,
            timeZone
        );
        const formattedEndDate = this.formatDate(
            currentEndDate,
            separator,
            timeZone
        );

        // Append the current request to the existing requests
        if (reportType === "stopReport") {
            requests = requests.pipe(
                concatMap((accumulatedData: any[]) =>
                    this.getVehicleStopData(
                        deviceId,
                        formattedStartDate,
                        formattedEndDate
                    ).pipe(
                        map((response) => {
                            // Check if response data is empty
                            if (response.data && response.data.length > 0) {
                                // Append data to accumulatedData
                                return accumulatedData.concat(response.data);
                            } else {
                                // Return accumulatedData unchanged if response data is empty
                                return accumulatedData;
                            }
                        }),
                        catchError((error) => {
                            // Handle error and return accumulatedData unchanged
                            console.error("Error occurred:", error);
                            return of(accumulatedData);
                        })
                    )
                )
            );
        } else if (reportType === "idleReport") {
            requests = requests.pipe(
                concatMap((accumulatedData: any[]) =>
                    this.getVehicleIdleData(
                        deviceId,
                        formattedStartDate,
                        formattedEndDate
                    ).pipe(
                        map((response) => {
                            // Check if response data is empty
                            if (response.data && response.data.length > 0) {
                                // Append data to accumulatedData
                                return accumulatedData.concat(response.data);
                            } else {
                                // Return accumulatedData unchanged if response data is empty
                                return accumulatedData;
                            }
                        }),
                        catchError((error) => {
                            // Handle error and return accumulatedData unchanged
                            console.error("Error occurred:", error);
                            return of(accumulatedData);
                        })
                    )
                )
            );
        } else if (reportType === "tripReport") {
            requests = requests.pipe(
                concatMap((accumulatedData: any[]) =>
                    this.getVehicleTripData(
                        deviceId,
                        formattedStartDate,
                        formattedEndDate
                    ).pipe(
                        map((response) => {
                            // Check if response data is empty
                            if (response.data && response.data.length > 0) {
                                // Append data to accumulatedData
                                return accumulatedData.concat(response.data);
                            } else {
                                // Return accumulatedData unchanged if response data is empty
                                return accumulatedData;
                            }
                        }),
                        catchError((error) => {
                            // Handle error and return accumulatedData unchanged
                            console.error("Error occurred:", error);
                            return of(accumulatedData);
                        })
                    )
                )
            );
        } else if (reportType === "overSpeedReport") {
            requests = requests.pipe(
                concatMap((accumulatedData: any[]) =>
                    this.getOverSpeedReportData(
                        deviceId,
                        formattedStartDate,
                        formattedEndDate,
                        speed
                    ).pipe(
                        map((response) => {
                            // Check if response data is empty
                            if (response.data && response.data.length > 0) {
                                // Append data to accumulatedData
                                return accumulatedData.concat(response.data);
                            } else {
                                // Return accumulatedData unchanged if response data is empty
                                return accumulatedData;
                            }
                        }),
                        catchError((error) => {
                            // Handle error and return accumulatedData unchanged
                            console.error("Error occurred:", error);
                            return of(accumulatedData);
                        })
                    )
                )
            );
        } else if (reportType === "distanceReport") {
            requests = requests.pipe(
                concatMap((accumulatedData: any[]) =>
                    this.getVehicleDistanceData(
                        deviceId,
                        formattedStartDate,
                        formattedEndDate
                    ).pipe(
                        map((response) => {
                            // Check if response data is empty
                            if (response.data && response.data.length > 0) {
                                // Append data to accumulatedData
                                return accumulatedData.concat(response.data);
                            } else {
                                // Return accumulatedData unchanged if response data is empty
                                return accumulatedData;
                            }
                        }),
                        catchError((error) => {
                            // Handle error and return accumulatedData unchanged
                            console.error("Error occurred:", error);
                            return of(accumulatedData);
                        })
                    )
                )
            );
        }
    }

    return requests;
}
  private formatDate(date: Date, separator: string, timeZone: string): string {
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const seconds = ("0" + date.getSeconds()).slice(-2);
    return `${year}-${month}-${day}${separator}${hours}:${minutes}:${seconds}${timeZone}`;
  }

  getVehicleAcData(
    DeviceId: number | undefined,
    FromTime: string,
    ToTime: string
  ): Observable<any> {
    const payload = {
      DeviceId: DeviceId,
      FromTime: FromTime,
      ToTime: ToTime,
    };
    return this.client
      .post<any>(`${environment.url}/api/reports/AcReport`, payload)
      .pipe(
        map((res: any) => {
          return res["data"];
        })
      );
  }
  getVehicleTemperatureData(
    DeviceId: number | undefined,
    FromTime: string,
    ToTime: string
  ): Observable<any> {
    const payload = {
      DeviceId: DeviceId,
      FromTime: FromTime,
      ToTime: ToTime,
    };
    return this.client
      .post<any>(`${environment.url}/api/reports/TempReport`, payload)
      .pipe(
        map((res: any) => {
          return res["data"];
        })
      );
  }
  getLocation(latitude: number, longitude: number): Observable<any> {
    return this.client.get(
      `https://s2-api.livetrack24.in/api/geocode/Geocode/vts/vts/${latitude}/${longitude}/`
    );
  }
}
