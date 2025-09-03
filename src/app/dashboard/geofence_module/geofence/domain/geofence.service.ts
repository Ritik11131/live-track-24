import { HttpClient } from '@angular/common/http';
import { Injectable, EventEmitter } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MappedGeofence } from './mappedGeofence.model';
import { Geofence } from './geofence.model';

declare var google: any; // Declare google variable

@Injectable({
  providedIn: 'root'
})
export class GeofenceService {
  placeSelected: EventEmitter<any> = new EventEmitter();

  constructor(private client: HttpClient) { }

  autocomplete(input: HTMLInputElement): void {
    const autocomplete = new google.maps.places.Autocomplete(input);
    // Add event listener to handle place selection
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      const place = autocomplete.getPlace();
      this.placeSelected.emit(place); // Emit the selected place
    });
  }


  unLinkGeofence(id: number): Observable<any> {
    return this.client
      .delete<any>(`${environment.url}/api/GeofenceLink/${id}`)
      .pipe(
        map((res: any) => {
         
          return ;
        })
      );
  }
  getGeofenceByDeviceId(id:number){
    return this.client.get<MappedGeofence[]>(`${environment.url}/api/GeofenceLink/ByDeviceId/${id}`).pipe(
      map((res: any) => {
        return res["data"];
      })
    );
  }
  getlinkedDevices(id:number){
    return this.client.get<any[]>(`${environment.url}/api/GeofenceLink/ByGeofenceId/${id}`).pipe(
      map((res: any) => {
        return res["data"];
      })
    );
  }
  linkGeofence(geofenceId:number,devices:number[]){
    const payload={
        geofenceId:geofenceId,
        devices:devices

    }
    return this.client
    .post<any>(`${environment.url}/api/GeofenceLink`, payload)
    .pipe(
        map((res: any) => {
            return res["data"];
          })
    );
  }

  getGeofences(){
   return this.client.get<Geofence[]>(`${environment.url}/api/Geofence`)
    .pipe(
      map((res: any) => {
          return res;
        })
  );
  }
  sendGeofence(payload:any){
    return this.client.post<any>(`${environment.url}/api/Geofence`,payload)
     .pipe(
       map((res: any) => {
           return res;
         })
   );
   }
   loadGeofence(id:number){
    return this.client.get<any>(`${environment.url}/api/Geofence/${id}`)
     .pipe(
       map((res: any) => {
           return res;
         })
   );
   }
   deleteGeofence(id:number){
    return this.client.delete<any>(`${environment.url}/api/Geofence/${id}`)
     .pipe(
       map((res: any) => {
        console.log(res)
           return res;
         })
   );
   }

  updateGeofence(selectedGeofenceId:number|null,payload:any){
    return this.client.put<any>(`${environment.url}/api/Geofence/${selectedGeofenceId}`,payload)
     .pipe(
       map((res: any) => {
           return res;
         })
   );
   }
}