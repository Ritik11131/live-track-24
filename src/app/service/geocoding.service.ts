import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GeocodingService {

    constructor(private httpClient: HttpClient) {
    }

    geocode(lat: number, lon: number): Observable<any> {
        if(lat == null || lon == null || lat == 0.0 || lon == 0.0)  return throwError(() => new Error("Location not available"));
        return this.httpClient.get(`${environment.url}/api/Geocoding/${lat}/${lon}`);
    }

    getLocation(lat: number, lng: number): Promise<string> {
        return new Promise((resolve, reject) => {
            this.geocode(lat, lng).subscribe(
                (data: any) => {
                    resolve(data['data']);
                },
                (error: any) => {
                    resolve("Location Not Available");
                }
            );
        });
    }
}
