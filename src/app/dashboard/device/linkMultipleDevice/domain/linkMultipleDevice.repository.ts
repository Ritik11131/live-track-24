import { Injectable } from "@angular/core";
import { LinkMultipleDeviceService } from "./link-multiple-device.service";
import { Observable } from "rxjs";
import { User } from "src/app/dashboard/user/models/user.model";
import { UserService } from "src/app/dashboard/user/services/user.service";
import { DeviceService } from "src/app/service/device.service";

@Injectable()
export class linkMultipleDeviceRepository {
  constructor(
    public deviceService: DeviceService,
private linkMultipleDeviceService:LinkMultipleDeviceService,
    public userService: UserService
  ) {}

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
  linkUserData(userId: any[], deviceId: number): Observable<any> {
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
  linkPlans(payload:any): Observable<any> {
    return new Observable<any>((observer) => {
      this.linkMultipleDeviceService.linkPlans(payload).subscribe(
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
}
