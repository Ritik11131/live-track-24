import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MessageService } from "primeng/api";
import { CommonUtils } from "src/app/utils/commonUtils";
import { UserService } from "src/app/dashboard/user/services/user.service";
import { DeviceService } from "src/app/service/device.service";
import { Observable } from "rxjs";
import { Device } from "src/app/models/device";
import { User } from "src/app/dashboard/user/models/user.model";

@Injectable()
export class linkDeviceRepository {

    constructor(
        public userService: UserService,
        public deviceService: DeviceService,
        private messageService: MessageService,
        private httpClient: HttpClient,
      
    
      ) {
        CommonUtils.init(httpClient, messageService);
      }

      linkUserData(  userId:any[],deviceId:number): Observable<any> {
        return new Observable<any>((observer) => {
            this.deviceService.linkUser(userId, deviceId).subscribe(
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

      getUserData(): Observable<User[]> {
        return new Observable<User[]>((observer) => {
          this.userService.getUsers().subscribe(
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