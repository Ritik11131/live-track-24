import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {map, Observable, of} from 'rxjs';
import { environment } from 'src/environments/environment';
import {catchError} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class BmsService {

  constructor(private client: HttpClient) {
  }
  getBmsData(selectedVehicle:number|null): Observable<any> {
    return this.client.get(`${environment.url}/api/BMS/Dashboard/${selectedVehicle}`).pipe(
        map((res: any) => {

          return res["data"];
        })
    );
  }

  getBmsCoordinate(
      deviceId: number | undefined,
      fromTime: string,
      toTime: string
  ): Observable<any> {
    const payload = {
      DeviceId: deviceId?.toString(),
      FromTime: fromTime,
      ToTime: toTime,
    };
    return this.client
        .post<any>(`${environment.url}/api/v1/history`, payload)
        .pipe(
            catchError((error: any) => {
              console.error("Error occurred:", error);
              return of([]); // Return an empty array in case of error
            })
        );
  }
}
