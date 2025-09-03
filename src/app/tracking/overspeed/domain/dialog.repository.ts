import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MessageService } from "primeng/api";
import { CommonUtils } from "src/app/utils/commonUtils";
import { VehicleListService } from "src/app/service/vehicle-list.service";
import { Observable } from "rxjs";
import { MapData } from "src/app/helper-map";
@Injectable()
export class dialogRepository {
    data!: MapData;
    address!: String;

  constructor(
    private messageService: MessageService,
    private httpClient: HttpClient,
    private vehicleListService:VehicleListService,


  ) {
    CommonUtils.init(httpClient, messageService);
  }

  setOverSpeedValue(   payload:any):Observable<any>{
    return new Observable<any>((observer)=>{
        this.vehicleListService.setOverSpeedLimit(payload).subscribe(
            (data)=>{
                observer.next(data);
                observer.complete();
    },
    (error) => {
      observer.error(error);
    })
})
}
}