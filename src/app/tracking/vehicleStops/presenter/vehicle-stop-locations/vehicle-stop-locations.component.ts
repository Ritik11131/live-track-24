import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import {MessageService} from "primeng/api";
import { StopReport } from 'src/app/dashboard/report/domain/stopReport.model';
import { HttpClient } from "@angular/common/http";
import { vehicleStopRepository } from '../../domain/vehicleStop.repository';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';
import { GeocodingService } from 'src/app/service/geocoding.service';
import { VehicleListService } from 'src/app/service/vehicle-list.service';
import { CommonUtils } from 'src/app/utils/commonUtils';
import { ToastService } from 'src/app/service/toast.service';
@Component({
  selector: 'app-vehicle-stop-locations',
  standalone: true,
  imports: [DatePipe,CommonModule,SkeletonModule],
  templateUrl: './vehicle-stop-locations.component.html',
  styleUrls: ['./vehicle-stop-locations.component.scss'],
  providers:[vehicleStopRepository]
})
export class VehicleStopLocationsComponent implements OnInit,OnDestroy{
  stopReport:StopReport[]=[]
  deviceId!: number ;
  private subscription: Subscription;
  stopReportLoading: boolean = false;

  constructor(private vehicleListRepo: VehicleListService,
    private messageService: MessageService,
    private datePipe:DatePipe,
    private geoCoder: GeocodingService,
    private httpClient: HttpClient,
    private vehicleStopRepo: vehicleStopRepository,
    private toastService: ToastService




 ){        

  this.subscription = this.vehicleListRepo.data$.subscribe(data => {
    if (data !== undefined) {
      this.deviceId = data;
    }
  });
 }

  ngOnInit(): void {
this.stopReportLoading = true;
const currentDate = new Date();

const currentYear = currentDate.getFullYear();
const currentMonth = ('0' + (currentDate.getMonth() + 1)).slice(-2); // Adding 1 because months are zero-indexed
const currentDay = ('0' + currentDate.getDate()).slice(-2);
let startDate = `${currentYear}-${currentMonth}-${currentDay} 00:00:00`;
let endDate = `${currentYear}-${currentMonth}-${currentDay} 23:59:59`;
 startDate = CommonUtils.addTimeZone(startDate)
 endDate =  CommonUtils.addTimeZone(endDate)

    this.vehicleStopRepo.getStopReportData(this.deviceId, startDate, endDate,"stopReport").subscribe(
      (data) => {
        this.stopReport = data;
   
      },
      (e) => {
      this.toastService.toastMessage("error","Message", e.error.data);

          this.stopReportLoading=false
      },
      () => {this.stopReportLoading=false
      }
  );

  }



  



ngOnDestroy() {
  this.subscription.unsubscribe();
}
}
