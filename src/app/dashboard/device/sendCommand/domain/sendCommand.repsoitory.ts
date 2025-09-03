import { Injectable } from "@angular/core";

import { Observable } from "rxjs";

import { VehicleListService } from "src/app/service/vehicle-list.service";

@Injectable()
export class SendCommandRepository {

    constructor(
        private vehicleListService: VehicleListService,



      
    
      ) {
      
      }



      sendCommandData(deviceId: number | undefined,
        commandType: string,command:string | undefined = undefined): Observable<any> {
return new Observable<any>((observer) => {
this.vehicleListService.immobilizerValue(deviceId, commandType,command).subscribe(
 (data) => {
     observer.next(data);
     observer.complete();
 },
 (error) => {
     observer.error(error);
 })
})
}

    }