import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MessageService } from "primeng/api";
import { DeviceService } from "src/app/service/device.service";
import { CommonUtils } from "src/app/utils/commonUtils";
import { UserService } from "../../services/user.service";
import { User } from "../../models/user.model";
import { Observable } from "rxjs";
import { Device } from "src/app/models/device";
@Injectable()
export class listUserRepository {

  constructor(
    private messageService: MessageService,
    private httpClient: HttpClient,
    protected userService: UserService,
    public deviceService: DeviceService,
  ) {
    CommonUtils.init(httpClient, messageService);
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

  getUserById(id:number): Observable<User> {
    return new Observable<User>((observer) => {
      this.userService.getUser(id).subscribe(
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
  getDeviceData(deviceId:number): Observable<Device[]> {
    return new Observable<Device[]>((observer) => {
      this.deviceService.getDeviceList(deviceId).subscribe(
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


  showUserPasswordData(id:number): Observable<User> {
    return new Observable<User>((observer) => {
      this.userService.getUser(id).subscribe(
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

  deleteUsersData(id:number): Observable<User> {
    return new Observable<User>((observer) => {
      this.userService.deleteUser(id).subscribe(
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
