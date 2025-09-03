import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MessageService } from "primeng/api";
import { CommonUtils } from "src/app/utils/commonUtils";
import { DeviceService } from "src/app/service/device.service";
import { Observable } from "rxjs";
import { Device } from "src/app/models/device";
@Injectable()
export class createDeviceRepository {

    constructor(
        public deviceService: DeviceService,
        private messageService: MessageService,
        private httpClient: HttpClient,
      
    
      ) {
        CommonUtils.init(httpClient, messageService);
      }

      updateDeviceData(id: number, device: Device): Observable<Device> {
        return new Observable<Device>((observer) => {
          this.deviceService.updateDevice(id,device).subscribe(
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




     getAndPatchDeviceData(id: number): Observable<any> {
        return new Observable<any>((observer) => {
            this.deviceService.searchImei(id).subscribe(
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




    createDeviceData( device: Device,userId:number): Observable<Device> {
        return new Observable<Device>((observer) => {
            this.deviceService.createDevice(device,userId).subscribe(
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