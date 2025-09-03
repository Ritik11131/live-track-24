import { Injectable, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { Subject, Observable, map } from 'rxjs';
import { LinkGeofenceComponent } from '../presenter/link-geofence/link-geofence.component';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class GeofenceLinkService {
  private linkGeofencedialogResult = new Subject<string | null>();
  private linkGeofenceComponentRef?: ComponentRef<LinkGeofenceComponent>;
  constructor(private client: HttpClient,private componentFactoryResolver: ComponentFactoryResolver) {}
  open(viewContainerRef: ViewContainerRef, geofenceId:number,geofenceName:string): Observable<string | null> {
    if (this.linkGeofenceComponentRef) {
      this.linkGeofenceComponentRef.destroy();  // Ensure any existing dialog is destroyed
    }

    const factory = this.componentFactoryResolver.resolveComponentFactory(LinkGeofenceComponent);
    this.linkGeofenceComponentRef = viewContainerRef.createComponent(factory);
    this.linkGeofenceComponentRef.instance.geofenceId = geofenceId;
    this.linkGeofenceComponentRef.instance.geofenceName = geofenceName;

    return this.linkGeofencedialogResult.asObservable();
  }

  close(result: string | null) {
    this.linkGeofencedialogResult.next(result);
    this.linkGeofencedialogResult.complete();  // Close the observable stream
    this.linkGeofencedialogResult = new Subject<string | null>();  // Reset the Subject to be ready for new data

    if (this.linkGeofenceComponentRef) {
      this.linkGeofenceComponentRef.destroy();  // Destroy the dialog component
      this.linkGeofenceComponentRef = undefined;  // Clean up the reference
    }
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
}
