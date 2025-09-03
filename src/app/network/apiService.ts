import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { VehicleListResponse } from '../domain/tracking/vehicleListResponse';
import { VehicleDetailRequest } from '../domain/tracking/vehicleDetailRequest';
import { VehicleDetailResponse } from '../domain/tracking/vehicleDetailResponse';
import { CommandRequest } from '../domain/commands/commandRequest';
import { CommandResponse } from '../domain/commands/commandResponse';
import { HistoryReplayRequest } from '../domain/historyReplay/historyReplayRequest';
import { HistoryReplayResponse } from '../domain/historyReplay/historyReplayResponse';
import { ReportRequest } from '../domain/report/reportRequest';
import { IdleReportResponse } from '../domain/report/idleReportResponse';
import { StopReportResponse } from '../domain/report/stopReportResponse';
import { TripReportResponse } from '../domain/report/tripReportResponse';
import { DistanceReportReponse } from '../domain/report/distanceReportResponse';
import { OverspeedReportResponse } from '../domain/report/overSpeedReportResponse';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {}

  getVehicleList(): Observable<VehicleListResponse> {
    return this.http.get<VehicleListResponse>(`${environment.url}/api/VehicleList`);
  }

  getVehicleById(request: VehicleDetailRequest): Observable<VehicleDetailResponse> {
    return this.http.get<VehicleDetailResponse>(`${environment.url}/api/vehicleList/SearchByVehicle/${request.id}`);
  }

  sendCommand(request: CommandRequest): Observable<CommandResponse> {
    return this.http.post<CommandResponse>(`${environment.url}/api/Commands/Immobilizer`, request);
  }

  getPlayback(request: HistoryReplayRequest): Observable<HistoryReplayResponse[]> {
    return this.http.post<HistoryReplayResponse[]>(`${environment.url}/api/history`, request);
  }

  getVehicleStopData(payload: ReportRequest): Observable<StopReportResponse[]> {
    return this.http.post<StopReportResponse[]>(`${environment.url}/api/reports/StopReport`, { payload })
      .pipe(catchError((error) => {
        console.error("Error occurred:", error);
        return of([]);
      }));
  }

  getVehicleIdleData(payload: ReportRequest): Observable<IdleReportResponse[]> {
    return this.http.post<IdleReportResponse[]>(`${environment.url}/api/reports/IdleReport`, { payload })
      .pipe(catchError((error) => {
        console.error("Error occurred:", error);
        return of([]);
      }));
  }

  getVehicleTripData(payload: ReportRequest): Observable<TripReportResponse[]> {
    return this.http.post<TripReportResponse[]>(`${environment.url}/api/reports/TripReport`, { payload })
      .pipe(catchError((error) => {
        console.error("Error occurred:", error);
        return of([]);
      }));
  }

  getOverSpeedReportData(payload: ReportRequest): Observable<OverspeedReportResponse[]> {
    return this.http.post<OverspeedReportResponse[]>(`${environment.url}/api/reports/OverspeedReport`, { payload })
      .pipe(catchError((error) => {
        console.error("Error occurred:", error);
        return of([]);
      }));
  }

  getVehicleDistanceData(payload: ReportRequest): Observable<DistanceReportReponse[]> {
    return this.http.post<DistanceReportReponse[]>(`${environment.url}/api/reports/DistanceReport`, { payload })
      .pipe(catchError((error) => {
        console.error("Error occurred:", error);
        return of([]);
      }));
  }
}
  