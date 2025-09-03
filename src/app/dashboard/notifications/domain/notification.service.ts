import {Injectable} from '@angular/core';
import {HttpClient,HttpParams } from "@angular/common/http";
import {map, switchMap,Observable,of, pipe} from "rxjs";
import {environment} from "../../../../environments/environment";
import { CommonUtils } from '../../../utils/commonUtils';





@Injectable({
    providedIn: 'root'
})
export class NotificationService {
  private lastTime: string | null = null; // Define lastTime as a property
  private allNotifications: any[] = [];
    constructor(private client: HttpClient) {
    }

    getAllNotifications(limit:number,lastime:string|null,selectedNotificationType:string[]|null,selectedVehicle:number|null): Observable<any> {
      const payload:any={
        Limit:limit
      }
      if(lastime!==null){
        payload.LastTime=lastime;
      }
      if(selectedNotificationType!==null){
        payload.AlertType=selectedNotificationType;
      }
      if(selectedVehicle!==null){
        payload.DeviceId=selectedVehicle;
      }
      return this.client
      .post<any>(`${environment.url}/api/Alerts`,payload)
      .pipe(
        map((res: any) => {
          return res;
        })
      );
    }
 
    fetchDataForCurrentDay(lastTime: string | null = this.lastTime): Observable<any[]> {
      // Reset allNotifications array if lastTime is null (first call)
      if (lastTime === null) {
        this.allNotifications = [];
      }
  
      const payload: any = { Limit: 100 };
  
      if (lastTime !== null) {
        payload.LastTime = lastTime;
      }
  
      return this.client.post<any[]>(`${environment.url}/api/Alerts`, payload).pipe(
        switchMap((data: any[]) => {
          const currentDate = new Date();
          const currentDateString = CommonUtils.addTimeZone(new Date(currentDate.setHours(0, 0, 0)).toISOString());
  
          // Accumulate notifications
          this.allNotifications = this.allNotifications.concat(data);
  
          if (data.length === 100 && data[data.length - 1].eventtime > currentDateString) {
            // Fetch more data if necessary
            return this.fetchDataForCurrentDay(data[data.length - 1].eventtime);
          } else {
            // Return all accumulated notifications
            return of(this.allNotifications);
          }
        })
      );
    }
    
}