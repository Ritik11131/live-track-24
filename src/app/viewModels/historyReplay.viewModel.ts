import { Injectable } from '@angular/core';
import { from, Observable,  of,pipe } from 'rxjs';
import { ApiService } from '../network/apiService';
import { catchError, concatMap,map, toArray } from 'rxjs/operators';

import { HistoryReplayRequest } from '../domain/historyReplay/historyReplayRequest';
import { HistoryReplayResponse } from '../domain/historyReplay/historyReplayResponse';
import { ReportRequest } from 'src/app/domain/report/reportRequest';
import { IdleReportResponse } from 'src/app/domain/report/idleReportResponse';
import { StopReportResponse } from 'src/app/domain/report/stopReportResponse';
import { TripReportResponse } from 'src/app/domain/report/tripReportResponse';
import { DistanceReportReponse } from 'src/app/domain/report/distanceReportResponse';
import { OverspeedReportResponse } from 'src/app/domain/report/overSpeedReportResponse';

@Injectable({
  providedIn: 'root',
})
export class HistoryReplayViewModel {
  constructor(private apiService: ApiService) {}

  getPlayback(
    payload: HistoryReplayRequest
  ): Observable<HistoryReplayResponse[]> {
    return this.apiService.getPlayback(payload);
  }


  
  getReportData(payload: ReportRequest,    reportType: 'stopReport' | 'idleReport' | 'tripReport' | 'overSpeedReport' | 'distanceReport',
  ): Observable<any[]> {
    const separator = payload.FromTime.includes("T") ? "T" : " ";
    const timeZone = payload.FromTime.match(/([-+]\d{2}:\d{2})$/)?.[0] || "+00:00";
  
    const reportFunctionMap = {
      stopReport: (payload: ReportRequest) =>
        this.apiService.getVehicleStopData(payload),
      idleReport: (payload: ReportRequest) =>
        this.apiService.getVehicleIdleData(payload),
      tripReport: (payload: ReportRequest) =>
        this.apiService.getVehicleTripData(payload),
      overSpeedReport: (payload: ReportRequest) =>
        this.apiService.getOverSpeedReportData(payload),
      distanceReport: (payload: ReportRequest) =>
        this.apiService.getVehicleDistanceData(payload),
    } as const;
  
    const reportFunction = reportFunctionMap[reportType];
  
    if (!reportFunction) {
      return of([]); // Return an empty observable if the report type is invalid
    }
  
    const requests: Observable<any[]>[] = [];
    for (
      let currentDay = new Date(payload.FromTime);
      currentDay <= new Date(payload.ToTime);
      currentDay.setDate(currentDay.getDate() + 1)
    ) {
      let currentStartDate = new Date(currentDay);
      let currentEndDate = new Date(currentDay);
  
      if (this.formatDate(currentStartDate, separator, timeZone) === payload.FromTime) {
        const [hours, minutes, seconds] = payload.FromTime.split(separator)[1].split("+")[0]
          .split(":").map(Number);
        currentStartDate.setHours(hours, minutes, seconds);
      } else {
        currentStartDate.setHours(0, 0, 0);
      }
  
      if (this.formatDate(currentEndDate, separator, timeZone) === payload.ToTime) {
        const [hours, minutes, seconds] = payload.ToTime.split(separator)[1].split("+")[0]
          .split(":").map(Number);
        currentEndDate.setHours(hours, minutes, seconds);
      } else {
        currentEndDate.setHours(23, 59, 59);
      }
  
      const formattedStartDate = this.formatDate(currentStartDate, separator, timeZone);
      const formattedEndDate = this.formatDate(currentEndDate, separator, timeZone);
      const reportPayload: ReportRequest = {
        DeviceId: payload.DeviceId,
        FromTime: formattedStartDate,
        ToTime: formattedEndDate,
        SpeedLimit: payload.SpeedLimit,
      };
      
      requests.push(
        // reportFunction(reportPayload).pipe(
        //   map((response) => response.data || []),
        //   catchError((error) => {
        //     console.error("Error occurred:", error);
        //     return of([]);
        //   })
        // )
      );
    }
  
    return from(requests).pipe(
      concatMap((request) => request),
      toArray(), // Collect all emitted arrays into one array
      map((results: any[][]) => results.flat()) // Flatten the array of arrays
    );
  }
  
  
  

  private formatDate(date: Date, separator: string, timeZone: string): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    return `${year}-${month}-${day}${separator}${hours}:${minutes}:${seconds}${timeZone}`;
  }

 
}
