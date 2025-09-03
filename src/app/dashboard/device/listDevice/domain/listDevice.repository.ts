import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MessageService } from "primeng/api";
import { UserService } from "src/app/dashboard/user/services/user.service";
import { DeviceService } from "src/app/service/device.service";
import { Observable } from "rxjs";
import { Device } from "src/app/models/device";
import { linkedUser } from "src/app/demo/api/linkedUser";
@Injectable()
export class listDeviceRepository {

    constructor(
        public userService: UserService,
        public deviceService: DeviceService,
      ) {
      }

      getUserDeviceData(id:number): Observable<Device[]> {
        return new Observable<Device[]>((observer) => {
          this.deviceService.getUserDevices(id).subscribe(
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
    
      getDeviceData(): Observable<Device[]> {
        return new Observable<Device[]>((observer) => {
          this.deviceService.getAllDevices().subscribe(
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
    
      getUserListByDeviceIdData(deviceId:string): Observable<linkedUser[]> {
        return new Observable<linkedUser[]>((observer) => {
          this.deviceService.getUserListByDeviceId(deviceId).subscribe(
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
      unLinkUserData(  mappingId: number,
        deviceId: number,
        userId: number): Observable<any> {
        return new Observable<any>((observer) => {
            this.deviceService.unLinkUser(mappingId, deviceId, userId).subscribe(
            (data) => {
              observer.next(); // Emit the notifications
              observer.complete(); // Complete the observable
            },
            (error) => {
              observer.error(error); // Emit an error if there's any
            }
          );
        });
      }
      deleteDeviceData(id:number): Observable<Device> {
        return new Observable<Device>((observer) => {
          this.deviceService.deleteDevices(id).subscribe(
            () => {
              observer.next(); // Emit the notifications
              observer.complete(); // Complete the observable
            },
            (error) => {
              observer.error(error); // Emit an error if there's any
            }
          );
        });
      }


    }