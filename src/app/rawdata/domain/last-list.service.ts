import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { LastPoint } from "../../models/last-point";
import { MapData } from "../../helper-map";

@Injectable({
  providedIn: "root",
})
export class LastListService {
  constructor(private client: HttpClient) {}

  // getLastPoint(pageNumber: number, count: number = 50): Observable<any> {
  //     return this.client.get<any>(`${environment.url}/api/RawLastPoint/${pageNumber}/${count}`);
  // }

  // getDeviceHistoryPoints(deviceId: string, fromT: string, toT: string): Observable<any> {
  //     return this.client.post<any>(`${environment.url}/api/RawLastPoint`, {deviceId, fromT, toT});
  // }

  getRawData(deviceId: string): Observable<any> {
    // Prepare the request payload
    const payload = {
        deviceId: deviceId,
    };

    // Make the API call
    return this.client
      .post<any>(`${environment.url}/api/RawLastPoint`, payload)
      .pipe(
        map((res: any) => {
          return res['data'];
        })
      );
  }
}
