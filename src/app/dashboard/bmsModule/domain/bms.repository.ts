import { DeviceService } from "src/app/service/device.service";
import { BmsService } from "./bms.service";
import {filter, Observable, of} from "rxjs";
import { Injectable } from "@angular/core";
import { Device } from "src/app/models/device";
import {environment} from "../../../../environments/environment";
import {catchError} from "rxjs/operators";

@Injectable()
export class BmsRepository {
  devices: Device[] = [];

  constructor(public deviceService: DeviceService,
              private bmsService: BmsService) {
  }

  deviceData(): Observable<Device[]> {
    return new Observable<Device[]>((observer) => {
      this.deviceService.getAllDevices().subscribe(
          (data) => {
            // Filter devices where fkvehicletype is 16
            const filteredDevices = data.filter(device => device.fkVehicleType === 16);

            observer.next(filteredDevices); // Emit the filtered notifications
            observer.complete(); // Complete the observable
          },
          (error) => {
            observer.error(error); // Emit an error if there's any
          }
      );
    });
  }


  getBmsData(selectedVehicle:number|null): Observable<any> {
    return new Observable<any>((observer) => {
      this.bmsService.getBmsData(selectedVehicle).subscribe(
          (data) => {
              observer.next(data);
            observer.complete(); // Complete the observable
          },
          (error) => {
            observer.error(error); // Emit an error if there's any
          }
      );
    });
  }


  getCoordinatesData(
      deviceId: number | undefined,
      startDate: string,
      endDate: string
  ): Observable<any[]> {
    return new Observable<any>((observer) => {
      this.bmsService
          .getBmsCoordinate(deviceId, startDate, endDate)
          .subscribe(
              (data) => {
                observer.next(data['data']);
                observer.complete();
              },
              (error) => {
                observer.error(error);
              }
          );
    });
  }
}
