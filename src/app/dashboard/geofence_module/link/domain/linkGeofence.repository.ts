import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { UserService } from "src/app/dashboard/user/services/user.service";
import { Device } from "src/app/models/device";
import { DeviceService } from "src/app/service/device.service";
import { GeofenceLinkService } from "./linkGeofence.service";
@Injectable()
export class GeofenceLinkRepository {

    constructor(
        public deviceService: DeviceService,
private geofenceLinkService:GeofenceLinkService,
     
        public userService: UserService,

      
    
      ) {
      }


      getDeviceData(): Observable<Device[]> {
        return new Observable<Device[]>((observer) => {
          this.deviceService.getAllDevices().subscribe(
            (d) => {
             
              observer.next(d); // Emit the notificationsname: string; code: number; }[]
              observer.complete(); // Complete the observable
            },
            (error) => {
              observer.error(error); // Emit an error if there's any
            }
          );
        });
      }
    
      linkGeofence(geofenceId:number,devices:number[]): Observable<any> {
        return new Observable<any>((observer) => {
          this.geofenceLinkService.linkGeofence(geofenceId, devices).subscribe(
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
    }