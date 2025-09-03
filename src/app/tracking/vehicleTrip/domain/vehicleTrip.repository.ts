import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {MessageService} from "primeng/api";
import {CommonUtils} from "src/app/utils/commonUtils";
import {ReportService} from "src/app/dashboard/report/domain/report.service";
import {GeocodingService} from "src/app/service/geocoding.service";
import {TripReport} from 'src/app/dashboard/report/domain/tripReport.model';

import {Observable} from "rxjs";

@Injectable()
export class VehicleTripRepository {
    tripReport: TripReport[] = [];

    constructor(
        private messageService: MessageService,
        private httpClient: HttpClient,
        private reportService: ReportService,
        private geocoder: GeocodingService,
    ) {
        CommonUtils.init(httpClient, messageService);
    }

    getTripReportData(deviceId: number, startDate: string, endDate: string, reportType:'stopReport' | 'idleReport' | 'tripReport' | 'overSpeedReport' | 'distanceReport'): Observable<{ data: TripReport[], totalDistance: number }> {
        return new Observable<{ data: TripReport[], totalDistance: number }>((observer) => {
            this.reportService.getReportData(deviceId, startDate, endDate, reportType).subscribe(
                async (data) => {
                    let totalDistance = 0;
                    this.tripReport = data.filter(trip => trip.distance >= 0.5);

                    const addressPromises = this.tripReport.map(async (trip) => {
                        totalDistance += trip.distance;

                        const { startLat, startLng, endLat, endLng } = trip;

                        trip.tripStartTime = CommonUtils.convertUTCToIST(trip.tripStartTime);
                        trip.tripEndTime = CommonUtils.convertUTCToIST(trip.tripEndTime);
                        const tripStartTime = new Date(trip.tripStartTime);
                        const tripEndTime = new Date(trip.tripEndTime);

                        trip.duration = CommonUtils.calculateDuration(tripStartTime, tripEndTime);

                        // Use promises to wait for addresses
                        const startAddressPromise = this.geocoder.getLocation(startLat, startLng).then(address => {
                            trip.startAddress = address;
                        });

                        const endAddressPromise = this.geocoder.getLocation(endLat, endLng).then(address => {
                            trip.endAddress = address;
                        });

                        // Wait for both geocoding promises to resolve
                        await Promise.all([startAddressPromise, endAddressPromise]);
                    });

                    // Wait for all address promises to resolve
                    await Promise.all(addressPromises);

                    observer.next({ data: this.tripReport, totalDistance }); // Emit the notifications
                    observer.complete(); // Complete the observable
                },
                (error) => {
                    observer.error(error); // Emit an error if there's any
                }
            );
        });
    }



}
