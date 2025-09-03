import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MessageService } from "primeng/api";
import { CommonUtils } from "src/app/utils/commonUtils";
import { GeocodingService } from "src/app/service/geocoding.service";
import { VehicleListService } from "src/app/service/vehicle-list.service";
import { Observable } from "rxjs";
import { ReportService } from "src/app/dashboard/report/domain/report.service";

import { VehicleDetailMapperService } from "src/app/service/vehicle-detail-mapper.service";
import { StopReport } from "src/app/dashboard/report/domain/stopReport.model";
import { IdleReport } from "src/app/dashboard/report/domain/idleReport.model";

@Injectable()
export class vehicleListRepository {
  stopReport: StopReport[] = [];
  idleReport: IdleReport[] = [];
  constructor(
    private messageService: MessageService,
    private httpClient: HttpClient,
    private geoCoder: GeocodingService,
    private positionReport: VehicleDetailMapperService,
    private vehicleListService: VehicleListService,
    private summary: VehicleDetailMapperService,
    private reportService: ReportService
  ) {
    CommonUtils.init(httpClient, messageService);
  }

  getStopData(
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
            });
            observer.next(this.stopReport);
            observer.complete();
          },
          (error) => {
            observer.error(error);
          }
        );
    });
  }

  getIdleData(
    deviceId: number,
    startDate: string,
    endDate: string,
    reportType:'stopReport' | 'idleReport' | 'tripReport' | 'overSpeedReport' | 'distanceReport'
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
            });
            observer.next(this.idleReport);
            observer.complete();
          },
          (error) => {
            observer.error(error);
          }
        );
    });
  }

  getVehicleListData(): Observable<any> {
    return new Observable<any>((observer) => {
      this.vehicleListService.getVehicleList().subscribe(
        (d) => {
          const data = this.positionReport.getSummary(d);
          observer.next(data);
          observer.complete();
        },
        (error) => {
          observer.error(error);
        }
      );
    });
  }

  getCoordinatesData(
    deviceId: number | undefined,
    startDate: string,
    endDate: string
  ): Observable<any[]> {
    return new Observable<any[]>((observer) => {
      this.vehicleListService
        .getCoordinates(deviceId, startDate, endDate)
        .subscribe(
          (data) => {
            observer.next(data);
            observer.complete();
          },
          (error) => {
            observer.error(error);
          }
        );
    });
  }
}
