import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class ConfigurationDetailService {
  constructor(private http: HttpClient) {}

  sendconfigurationDetail(payload: any): Observable<any> {
    return this.http
      .put<any>(
        `${environment.url}/api/UserConfiguration/${payload.id}`,
        payload
      )
      .pipe(
        map((res: any) => {
          return res["data"];
        })
      );
  }
  getconfigurationDetail(fkUserId: number): Observable<any> {
    return this.http
      .get<any>(`${environment.url}/api/UserConfiguration/${fkUserId}`)
      .pipe(
        map((res: any) => {
          return res["data"];
        })
      );
  }

  getAdminConfigurationDetail(): Observable<any> {
    return this.http
      .get<any>(`${environment.url}/api/UserConfiguration`)
      .pipe(
        map((res: any) => {
          return res["data"];
        })
      );
  }
}
