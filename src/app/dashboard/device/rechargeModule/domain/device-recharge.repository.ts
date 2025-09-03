import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { DeviceRechargeService } from "./device-recharge.service";
@Injectable()
export class DeviceRechargeRepository {
  constructor(private deviceRechargeService: DeviceRechargeService) {}

  setNextValidity(payload: any): Observable<any> {
    return new Observable<any>((observer) => {
      this.deviceRechargeService.setNextValidity(payload).subscribe(
        (data) => {
          observer.next(data);
          observer.complete();
        },
        (error) => {
          observer.error(error);
        }
      );
    });
  }
}
