import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MessageService } from "primeng/api";
import { CommonUtils } from "src/app/utils/commonUtils";
import { ReportService } from "src/app/dashboard/report/domain/report.service";
import { GeocodingService } from "src/app/service/geocoding.service";
import { StopReport } from 'src/app/dashboard/report/domain/stopReport.model';

import { Observable } from "rxjs";
import { Device } from "src/app/models/device";
@Injectable()
export class vehicleStopRepository {
    stopReport:StopReport[]=[]

  constructor(
    private messageService: MessageService,
    private geocoderService: GeocodingService,
    private reportService: ReportService,
    private geoCoder: GeocodingService,

  ) {

  }
  getStopReportData(    deviceId: number,
    startDate: string,
    endDate: string,
    reportType: 'stopReport' | 'idleReport' | 'tripReport' | 'overSpeedReport' | 'distanceReport'): Observable<any[]> {
    return new Observable<any[]>((observer) => {
        this.reportService.getReportData( deviceId,startDate,endDate,reportType).subscribe(
        (data) => {
            this.stopReport = data;
            this.stopReport.forEach((stop) => {
                stop.dormantStart = CommonUtils.convertUTCToIST(stop.dormantStart);
                stop.dormantEnd = CommonUtils.convertUTCToIST(stop.dormantEnd);
                const dormantStart = new Date(stop.dormantStart);
                const dormantEnd = new Date(stop.dormantEnd);
  
  
                stop.duration = CommonUtils.calculateDuration(dormantStart, dormantEnd)
                const latitude = stop.latitude;
                const longitude = stop.longitude;
  
  
              this.geocoderService.getLocation(latitude, longitude).then(address => {
                stop.address = address; // Store the address in the report object
              });
  
          
            });       
          observer.next(this.stopReport); // Emit the notifications
          observer.complete(); // Complete the observable
        },
        (error) => {
          observer.error(error); // Emit an error if there's any
        }
      );
    });
  }

}