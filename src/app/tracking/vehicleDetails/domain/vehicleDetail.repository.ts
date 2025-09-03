import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {MessageService} from "primeng/api";
import {CommonUtils} from "src/app/utils/commonUtils";
import {GeocodingService} from "src/app/service/geocoding.service";
import {VehicleListService} from "src/app/service/vehicle-list.service";
import {Observable} from "rxjs";
import {MapData} from "src/app/helper-map";
import {VehicleDetailMapperService} from "src/app/service/vehicle-detail-mapper.service";

@Injectable()
export class vehicleDetailRepository {
    data!: MapData;
    address!: String;

    constructor(
        private messageService: MessageService,
        private httpClient: HttpClient,
        private geoCoder: GeocodingService,
        private vehicleListService: VehicleListService,
        private summary: VehicleDetailMapperService,
    ) {
        CommonUtils.init(httpClient, messageService);
    }

    setimmobilizerData(deviceId: number | undefined,
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



    getVehicleByIdData(deviceId: number): Observable<any> {
        return new Observable<any>((observer) => {
            this.vehicleListService.getVehicleById(deviceId).subscribe(
                (data) => {

                    const r = this.summary.getSummary([data]);
                    this.data = r.details[0];

                    this.data.position.servertime = this.lastUpDated(
                        new Date().getTime() -
                        new Date(this.data.position.servertime).getTime()
                    );

                    this.data.validity.nextRechargeDate = this.nextRechargeDate(
                        new Date(this.data.validity.nextRechargeDate).getTime() -
                        new Date().getTime()
                    );

                    this.data.device.details.lastOdometer =
                        ((this.data.position.details.totalDistance) - CommonUtils.checkUndefined(this.data.device.details.lastOdometer,0));


                    let latLng = this.data.position.position;
                    this.geoCoder
                        .geocode(latLng?.lat ?? 0.0, latLng?.lng ?? 0.0)
                        .subscribe(
                            (d) => {
                                this.address = d["data"];
                                const result = {data: this.data, address: this.address}; // Combine data and address into an object
                                observer.next(result); // Emit the object
                                observer.complete();
                            },
                            (error) => {
                                this.address = "Location Not Available";
                                const result = {data: this.data, address: this.address}; // Combine data and address into an object
                                observer.next(result); // Emit the object
                                observer.complete();
                            }
                        );

                },
                (error) => {
                    observer.error(error);
                })
        })
    }

    lastUpDated(differenceMs: number): string {
        // Convert milliseconds to seconds
        const differenceSeconds = Math.floor(differenceMs / 1000);

        // Calculate individual units
        const days = Math.floor(differenceSeconds / 86400); // 1 day = 24 * 60 * 60 seconds
        const hours = Math.floor((differenceSeconds % 86400) / 3600);
        const minutes = Math.floor((differenceSeconds % 3600) / 60);
        const seconds = differenceSeconds % 60;

        // Generate the formatted string
        let formattedString = "";
        if (days > 0) {
            formattedString += `${days}day${days > 1 ? "s" : ""} `;
        }
        if (hours > 0) {
            formattedString += `${hours}hr${hours > 1 ? "s" : ""} `;
        }
        if (minutes > 0) {
            formattedString += `${minutes}min${minutes > 1 ? "s" : ""} `;
        }
        if (seconds > 0 || formattedString === "") {
            formattedString += `${seconds}sec${seconds > 1 ? "s" : ""} `;
        }

        formattedString += "ago";

        return formattedString.trim();
    }

    nextRechargeDate(differenceMs: number): string {
        const days = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
        //

        // Format the result into a string
        let result = "";
        if (days > 0) {
            result += `${days} day${days > 1 ? "s" : ""} `;
        }

        return result.trim();
    }
}