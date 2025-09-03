import { Injectable } from "@angular/core";
import { DistanceReport } from "./distanceReport.model";
import { StopReport } from "./stopReport.model";
import { IdleReport } from "./idleReport.model";
import { TripReport } from "./tripReport.model";
import { OverSpeedReport } from "./overSpeedReport.model";
import { ReportService } from "src/app/dashboard/report/domain/report.service";
import { forkJoin, map, Observable } from "rxjs";
import { CommonUtils } from "src/app/utils/commonUtils";
import { DeviceService } from "src/app/service/device.service";
import { SocReport } from "./socReport.model";
import { VehicleListService } from "src/app/service/vehicle-list.service";
import { TempReport } from "./tempReport.model";
import { DetailReport } from "./detailReport.model";

@Injectable()
export class ReportRepository {
    constructor(
        private reportService: ReportService,

        public deviceService: DeviceService,
        private vehicleListService: VehicleListService
    ) {}

    distanceReport: DistanceReport[] = [];
    stopReport: StopReport[] = [];
    idleReport: IdleReport[] = [];
    tripReport: TripReport[] = [];
    overspeedReport: OverSpeedReport[] = [];

    devices: any[] = [];

    getDeviceData(): Observable<any[]> {
        return new Observable<any[]>((observer) => {
            this.deviceService.getAllDevices().subscribe(
                (d) => {
                    this.devices = d.map((d) => ({
                        name: d.vehicleNo, // Using deviceId as the name
                        code: d.id, // Using id as the code
                        // You can add other properties from device if needed
                    }));
                    observer.next(this.devices);
                    observer.complete();
                },
                (error) => {
                    observer.error(error); // Emit an error if there's any
                }
            );
        });
    }

    getDistanceReportData(
        deviceId: number,
        startDate: string,
        endDate: string,
        reportType: 'stopReport' | 'idleReport' | 'tripReport' | 'overSpeedReport' | 'distanceReport'
    ): Observable<{ distanceReport: DistanceReport[]; totalDistance: number }> {
        return new Observable<{ distanceReport: DistanceReport[]; totalDistance: number }>((observer) => {
            this.reportService
                .getReportData(deviceId, startDate, endDate, reportType)
                .subscribe(
                    (data: DistanceReport[]) => {
                        let totalDistance = 0;
                        data.forEach((distance) => {
                            totalDistance += distance.distance;
                            distance.startAddress = "address"; // Store the address in the report object
                            distance.endAddress = "loading address"; // Store the address in the report object
                        });
                        if (data.length === 0) {
                            observer.error(new Error('No data available for the given parameters.'));
                        } else {
                            observer.next({ distanceReport: data, totalDistance });
                            observer.complete(); // Complete the observer
                        }

                    },
                    (error) => {
                        observer.error(error); // Emit an error if there's any
                    }
                );
        });
    }

    getTripReportData(
        deviceId: number,
        startDate: string,
        endDate: string,
        reportType: 'stopReport' | 'idleReport' | 'tripReport' | 'overSpeedReport' | 'distanceReport'
    ): Observable<TripReport[]> {
        return new Observable<TripReport[]>((observer) => {
            this.reportService
                .getReportData(deviceId, startDate, endDate, reportType)
                .subscribe(
                    (data) => {
                        this.tripReport = data.filter(trip => trip.distance > .5);
                        this.tripReport.forEach((trip) => {
                            trip.tripStartTime = CommonUtils.convertUTCToIST(
                                trip.tripStartTime
                            );
                            trip.tripEndTime = CommonUtils.convertUTCToIST(trip.tripEndTime);
                            const tripStartTime = new Date(trip.tripStartTime);
                            const tripEndTime = new Date(trip.tripEndTime);

                            trip.duration = CommonUtils.calculateDuration(
                                tripStartTime,
                                tripEndTime
                            );

                            trip.startAddress = "loading address"; // Store the address in the report object

                            trip.endAddress = "loading address"; // Store the address in the report object
                        });
                        if (this.tripReport.length === 0) {
                            observer.error(new Error('No data available for the given parameters.'));
                        } else {
                            observer.next(this.tripReport); // Notify the observer with the complete data
                            observer.complete(); // Complete the observer
                        }
                    },
                    (error) => {
                        observer.error(error); // Emit an error if there's any
                    }
                );
        });
    }

    getStopReportData(
        deviceId: number,
        startDate: string,
        endDate: string,
        reportType: 'stopReport' | 'idleReport' | 'tripReport' | 'overSpeedReport' | 'distanceReport'
    ): Observable<StopReport[]> {
        return new Observable<StopReport[]>((observer) => {
            this.reportService
                .getReportData(deviceId, startDate, endDate, reportType)
                .subscribe(
                    (data) => {
                        this.stopReport = data;
                        this.stopReport.forEach((stop) => {
                            stop.dormantStart = CommonUtils.convertUTCToIST(
                                stop.dormantStart
                            );
                            stop.dormantEnd = CommonUtils.convertUTCToIST(stop.dormantEnd);
                            const dormantStart = new Date(stop.dormantStart);
                            const dormantEnd = new Date(stop.dormantEnd);

                            stop.duration = CommonUtils.calculateDuration(
                                dormantStart,
                                dormantEnd
                            );

                            stop.address = "loading address"; // Store the address in the report object
                        });
                        if (this.stopReport.length === 0) {
                            observer.error(new Error('No data available for the given parameters.'));
                        } else {
                            observer.next(this.stopReport); // Notify the observer with the complete data
                            observer.complete(); // Complete the observer
                        }
                    },
                    (error) => {
                        observer.error(error); // Emit an error if there's any
                    }
                );
        });
    }

    getIdleReportData(
        deviceId: number,
        startDate: string,
        endDate: string,
        reportType: 'stopReport' | 'idleReport' | 'tripReport' | 'overSpeedReport' | 'distanceReport'
    ): Observable<IdleReport[]> {
        return new Observable<IdleReport[]>((observer) => {
            this.reportService
                .getReportData(deviceId, startDate, endDate, reportType)
                .subscribe(
                    (data) => {
                        this.idleReport = data;
                        this.idleReport.forEach((idle) => {
                            idle.dormantStart = CommonUtils.convertUTCToIST(
                                idle.dormantStart
                            );
                            idle.dormantEnd = CommonUtils.convertUTCToIST(idle.dormantEnd);
                            const dormantStart = new Date(idle.dormantStart);
                            const dormantEnd = new Date(idle.dormantEnd);

                            idle.duration = CommonUtils.calculateDuration(
                                dormantStart,
                                dormantEnd
                            );

                            idle.address = "loading address"; // Store the address in the report object
                        });
                        if (this.idleReport.length === 0) {
                            observer.error(new Error('No data available for the given parameters.'));
                        } else {
                            observer.next(this.idleReport); // Notify the observer with the complete data
                            observer.complete(); // Complete the observer
                        }
                    },
                    (error) => {
                        observer.error(error); // Emit an error if there's any
                    }
                );
        });
    }

    getOverSpeedReportData(
        deviceId: number,
        startDate: string,
        endDate: string,
        reportType: 'stopReport' | 'idleReport' | 'tripReport' | 'overSpeedReport' | 'distanceReport',
        speed: number
    ): Observable<OverSpeedReport[]> {
        return new Observable<OverSpeedReport[]>((observer) => {
            this.reportService
                .getReportData(deviceId, startDate, endDate, reportType, speed)
                .subscribe(
                    (data) => {
                        this.overspeedReport = data;
                        this.overspeedReport.forEach((speed) => {
                            speed.speedStartTime = CommonUtils.convertUTCToIST(
                                speed.speedStartTime
                            );
                            speed.speedEndTime = CommonUtils.convertUTCToIST(
                                speed.speedEndTime
                            );
                            const startTime = new Date(speed.speedStartTime);
                            const endTime = new Date(speed.speedEndTime);
                            speed.duration = CommonUtils.calculateDuration(
                                startTime,
                                endTime
                            );
                            speed.startAddress = "loading address"; // Store the address in the report object

                            speed.endAddress = "loading address"; // Store the address in the report object
                        });
                        if (this.overspeedReport.length === 0) {
                            observer.error(new Error('No data available for the given parameters.'));
                        } else {
                            observer.next(this.overspeedReport); // Notify the observer with the complete data
                            observer.complete(); // Complete the observer
                        }
                    },
                    (error) => {
                        observer.error(error); // Emit an error if there's any
                    }
                );
        });
    }

    getSocReportData(
        deviceId: number | undefined,
        startDate: string,
        endDate: string
    ): Observable<SocReport[]> {
        return new Observable((observer) => {
            const subscription = this.vehicleListService
                .getCoordinates(deviceId, startDate, endDate)
                .subscribe(
                    (data) => {
                        const socReportData: SocReport[] = []; // Initialize local array for reports

                        data.forEach((soc) => {
                            const bmsSOCValue = soc.details.bmsSOC;
                            const bmsSOC =
                                bmsSOCValue !== undefined && typeof bmsSOCValue === "number"
                                    ? parseFloat(bmsSOCValue.toFixed(2))
                                    : 0;

                            const socReport: SocReport = {
                                bmsSOC: bmsSOC,
                                latlng: {
                                    lat: soc.latitude || 0,
                                    lng: soc.longitude || 0,
                                },
                                timestamp: CommonUtils.convertUTCToIST(soc.timestamp || ""),
                            };

                            socReportData.push(socReport); // Push the report into the local array
                        });

                        if (socReportData.length === 0) {
                            observer.error(new Error('No data available for the given parameters.'));
                        } else {
                            observer.next(socReportData); // Notify the observer with the complete data
                            observer.complete(); // Complete the observer
                        }
                    },
                    (error) => {
                        observer.error(error); // Handle errors
                    }
                );

            // Cleanup function to unsubscribe from the observable
            return () => subscription.unsubscribe();
        });
    }

    getTempReportData(
        deviceId: number | undefined,
        startDate: string,
        endDate: string
    ): Observable<TempReport[]> {
        return new Observable((observer) => {
            const subscription = this.vehicleListService
                .getCoordinates(deviceId, startDate, endDate)
                .subscribe(
                    (data) => {
                        const tempReportData: TempReport[] = []; // Initialize local array for reports

                        data.forEach((temp) => {
                            const tempValue = temp.details.temp;
                            const temperature =
                                tempValue !== undefined && typeof tempValue === "number"
                                    ? parseFloat(tempValue.toFixed(2))
                                    : 0;

                            const tempReport: TempReport = {
                                temp: temperature,
                                latlng: {
                                    lat: temp.latitude || 0,
                                    lng: temp.longitude || 0,
                                },
                                timestamp: CommonUtils.convertUTCToIST(temp.timestamp || ""),
                            };

                            tempReportData.push(tempReport); // Push the report into the local array
                        });

                        if (tempReportData.length === 0) {
                            observer.error(new Error('No data available for the given parameters.'));
                        } else {
                            observer.next(tempReportData); // Notify the observer with the complete data
                            observer.complete(); // Complete the observer
                        }
                    },
                    (error) => {
                        observer.error(error); // Handle errors
                    }
                );

            // Cleanup function to unsubscribe from the observable
            return () => subscription.unsubscribe();
        });
    }

    getDetailReportData(
        deviceId: number | undefined,
        startDate: string,
        endDate: string,
        timespan: number
    ): Observable<DetailReport[]> {
        return new Observable((observer) => {
            const subscription = this.vehicleListService
                .getCoordinates(deviceId, startDate, endDate)
                .subscribe(
                    async (data) => {
                        let DetailData: any[] = []; // Initialize local array for reports
                        if (timespan === undefined) {
                            DetailData = data;
                        } else {
                            let lastTimeStamp = data[0].timestamp;
                            DetailData.push(data[0]);
                            for (let i = 1; i < data.length; i++) {
                                const currentTimestamp = data[i].timestamp;
                                const difference = this.getTimeDifference(
                                    lastTimeStamp,
                                    currentTimestamp
                                );

                                if (difference >= timespan * 60) {
                                    DetailData.push(data[i]);
                                    lastTimeStamp = currentTimestamp;
                                }
                            }
                        }

                        const detailReports: DetailReport[] = [];

                        for (const report of DetailData) {
                            const address = "Loading Address";
                            const detail: DetailReport = {
                                timestamp: CommonUtils.convertUTCToIST(report.timestamp || ""),
                                ignstatus: report.details.ign,
                                speed: report.speed,
                                latlng: {
                                    lat: report.latitude || 0,
                                    lng: report.longitude || 0,
                                },
                                address: address, // Store the address in the report object
                            };

                            // Conditionally add properties if they exist
                            if (report.details.ac !== undefined) {
                                detail.ac = report.details.ac;
                            }
                            if (report.details.extVolt !== undefined) {
                                detail.extVolt = report.details.extVolt;
                            }
                            if (report.details.door !== undefined) {
                                detail.door = report.details.door;
                            }

                            detailReports.push(detail);
                        }
                        if (detailReports.length === 0) {
                            observer.error(new Error('No data available for the given parameters.'));
                        } else {
                            observer.next(detailReports); // Notify the observer with the complete data
                            observer.complete(); // Complete the observer
                        }
                    },
                    (error) => {
                        observer.error(error); // Handle errors
                    }
                );

            // Cleanup function to unsubscribe from the observable
            return () => subscription.unsubscribe();
        });
    }

    getTimeDifference(time1: string, time2: string): number {
        // Parse the datetime strings into Date objects
        const dt1 = new Date(time1);
        const dt2 = new Date(time2);

        // Get the time value in milliseconds
        const time1Ms = dt1.getTime();
        const time2Ms = dt2.getTime();

        // Calculate the difference in milliseconds
        const difference = Math.abs(time2Ms - time1Ms);

        // Convert milliseconds to seconds
        const differenceInSeconds = difference / 1000;

        return differenceInSeconds;
    }

    getMultipleVehicleDistanceData(
        deviceIds: number[],
        fromDate: string,
        toDate: string
      ): Observable<any[]> {
        const observables = deviceIds.map((deviceId) => 
          this.reportService.getVehicleDistanceData(deviceId, fromDate, toDate).pipe(
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
}
