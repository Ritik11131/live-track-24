import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {ConfigurationDetailService} from "./configurationDetail.service";
import {Observable} from "rxjs";
import {Notification} from "../../../notifications/domain/notification.model";
import {CommonUtils} from "../../../../utils/commonUtils";

@Injectable()
export class ConfigurationDetailRepositiory {
    constructor(private configurationDetailService:ConfigurationDetailService) { }

    sendConfigData(payload:any): Observable<any>{
        return new Observable<any>((observer) => {
            this.configurationDetailService
                .sendconfigurationDetail(
                   payload
                )
                .subscribe(
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

    getConfigData(id:number): Observable<any>{
        return new Observable<any>((observer) => {
            this.configurationDetailService
                .getconfigurationDetail(
                    id
                )
                .subscribe(
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
    getAdminConfigurationDetail(): Observable<any>{
        return new Observable<any>((observer) => {
            this.configurationDetailService
                .getAdminConfigurationDetail(
                )
                .subscribe(
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