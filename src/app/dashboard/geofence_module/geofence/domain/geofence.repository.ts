import { Injectable } from "@angular/core";
import { DeviceService } from "src/app/service/device.service";
import { Observable } from "rxjs";
import { GeofenceService } from "./geofence.service";
import { MappedGeofence } from "./mappedGeofence.model";
import { Geofence } from "./geofence.model";
@Injectable()
export class GeofenceRepository {

    constructor(
        public deviceService: DeviceService,
        public geofenceService: GeofenceService,

      ) {
      }
      linkGeofence(geofenceId:number,devices:number[]): Observable<any> {
        return new Observable<any>((observer) => {
          this.geofenceService.linkGeofence(geofenceId, devices).subscribe(
            (data) => {
              observer.next(data); // Emit the notifications
              observer.complete(); // Complete the observable
            },
            (error) => {
              observer.error(error); // Emit an error if there's any
            }
          );
        });
      }
    
      getDeviceData(): Observable<{ name: string; code: number; }[]> {
        return new Observable<{ name: string; code: number; }[]>((observer) => {
          this.deviceService.getAllDevices().subscribe(
            (d) => {
               let devices= d.map((d) => ({
                  name: d.vehicleNo, // Using deviceId as the name
                  code: d.id, // Using id as the code
                  // You can add other properties from device if needed
                }));
              observer.next(devices); // Emit the notificationsname: string; code: number; }[]
              observer.complete(); // Complete the observable
            },
            (error) => {
              observer.error(error); // Emit an error if there's any
            }
          );
        });
      }
    
      unLinkGeofence(mappingId:number): Observable<any> {
        return new Observable<any>((observer) => {
          this.geofenceService.unLinkGeofence(mappingId).subscribe(
            (d) => {
              observer.next("Geofence Unlinked Successfully"); // Emit the notificationsname: string; code: number; }[]
              observer.complete(); // Complete the observable
            },
            (error:any) => {
              observer.error(error); // Emit an error if there's any
            }
          );
        });
      }
      getGeofenceByDeviceId(id:number): Observable<MappedGeofence[]> {
        return new Observable<MappedGeofence[]>((observer) => {
          this.geofenceService.getGeofenceByDeviceId(id).subscribe(
            (data) => {
           
              observer.next(data);
              observer.complete();
            },
            (error) => {
              observer.error(error); // Emit an error if there's any
            }
          );
        });
      }


      getlinkedDevices(id:number): Observable<any[]> {
        return new Observable<any[]>((observer) => {
          this.geofenceService.getlinkedDevices(id).subscribe(
            (data) => {
           
              observer.next(data);
              observer.complete();
            },
            (error) => {
              observer.error(error); // Emit an error if there's any
            }
          );
        });
      }
 
      deleteGeofence(id:number): Observable<any[]> {
        return new Observable<any[]>((observer) => {
          this.geofenceService.deleteGeofence(id).subscribe(
            (data) => {
           
              observer.next(data);
              observer.complete();
            },
            (error) => {
              observer.error(error); // Emit an error if there's any
            }
          );
        });
      }
 


      getGeofences(): Observable<Geofence[]> {
        return new Observable<Geofence[]>((observer) => {
          this.geofenceService.getGeofences().subscribe(
            (response) => {
              let geofences = response.data.map((geofence: any) => ({
                ...geofence,
                isSelected: false, // Initialize as false
                isLinked: geofence.isLinked || false,
              }));
              observer.next(geofences);
              observer.complete();
            },
            (error) => {
              observer.error(error); // Emit an error if there's any
            }
          );
        });
      }

      sendGeofence(payload:any): Observable<any> {
        return new Observable<any>((observer) => {
          this.geofenceService.sendGeofence(payload).subscribe(
            (response) => {
              observer.next(response);
              observer.complete();
            },
            (error) => {
              observer.error(error); // Emit an error if there's any
            }
          );
        });
      }
      loadGeofence(id:number): Observable<any> {
        return new Observable<any>((observer) => {
          this.geofenceService.loadGeofence(id).subscribe(
            (response) => {
              observer.next(response);
              observer.complete();
            },
            (error) => {
              observer.error(error); // Emit an error if there's any
            }
          );
        });
      }
      updateGeofence(selectedGeofenceId:number|null,payload:any): Observable<any> {
        return new Observable<any>((observer) => {
          this.geofenceService.updateGeofence(selectedGeofenceId,payload).subscribe(
            (response) => {
              observer.next(response);
              observer.complete();
            },
            (error) => {
              observer.error(error); // Emit an error if there's any
            }
          );
        });
      }
    }