import {Component, OnDestroy, OnInit} from '@angular/core';
import {TripReport} from 'src/app/dashboard/report/domain/tripReport.model';
import {DatePipe} from '@angular/common';
import {MessageService} from "primeng/api";
import {CommonModule} from '@angular/common';
import {Subscription} from 'rxjs';
import {SkeletonModule} from 'primeng/skeleton';
import {ButtonModule} from 'primeng/button';
import {VehicleListService} from 'src/app/service/vehicle-list.service';
import {CommonUtils} from 'src/app/utils/commonUtils';
import {HttpClient} from "@angular/common/http";
import {VehicleTripRepository} from '../../domain/vehicleTrip.repository';
import {ToastService} from 'src/app/service/toast.service';

@Component({
    selector: 'app-vehicle-trips',
    standalone: true,
    imports: [DatePipe, CommonModule, ButtonModule, SkeletonModule],
    templateUrl: './vehicle-trips.component.html',
    styleUrls: ['./vehicle-trips.component.scss'],
    providers: [DatePipe, VehicleTripRepository]
})
export class VehicleTripsComponent implements OnInit, OnDestroy {
    tripReport: TripReport[] = [];
    deviceId!: number;
    private subscription: Subscription;
    tripReportLoading: boolean = false;
    totalTripDistance: number = 0;

    constructor(
        private vehicleListRepo: VehicleListService,
        private messageService: MessageService,
        private httpClient: HttpClient,
        private vehicleTripRepo: VehicleTripRepository,
        private toastService: ToastService
    ) {
        this.subscription = this.vehicleListRepo.data$.subscribe(data => {
            if (data !== undefined) {
                this.deviceId = data;
            }
        });
    }

    ngOnInit(): void {
        this.loadTripReport();
    }

    private loadTripReport() {
        this.tripReportLoading = true;
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = ('0' + (currentDate.getMonth() + 1)).slice(-2); // Adding 1 because months are zero-indexed
        const currentDay = ('0' + currentDate.getDate()).slice(-2);
        let startDate = `${currentYear}-${currentMonth}-${currentDay} 00:00:00`;
        let endDate = `${currentYear}-${currentMonth}-${currentDay} 23:59:59`;
        startDate = CommonUtils.addTimeZone(startDate);
        endDate = CommonUtils.addTimeZone(endDate);

        this.vehicleTripRepo.getTripReportData(this.deviceId, startDate, endDate, "tripReport").subscribe(
            (data) => {
                this.tripReport = data.data;
                this.totalTripDistance = data.totalDistance;
            },
            (error) => {
                this.toastService.toastMessage("error", "Message", error.error.data);
                this.tripReportLoading = false;
            },
            () => {
                this.tripReportLoading = false;
            }
        );
    }

    showTripOnMap(startDate: string, endDate: string) {
        const tripData = {
            deviceId: this.deviceId,
            startDate: CommonUtils.addTimeZone(startDate),
            endDate: CommonUtils.addTimeZone(endDate),
        };
        this.vehicleListRepo.sendtripData(tripData); // Correct method name here
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
