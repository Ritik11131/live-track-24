import { DeviceService } from "src/app/service/device.service";
import { NotificationService } from "src/app/dashboard/notifications/domain/notification.service";
import { Notification } from "src/app/dashboard/notifications/domain/notification.model";
import { CommonUtils } from "src/app/utils/commonUtils";
import { Observable } from 'rxjs';
import { Injectable } from "@angular/core";
import { Device } from "src/app/models/device";
import {GeocodingService} from "../../../service/geocoding.service";

@Injectable()
export class notificationRepository{
    notifications: Notification[] = [];
    devices: Device[] = [];

    constructor(    public deviceService: DeviceService,
                    private notificationService: NotificationService,
                    private geocoder:GeocodingService,


    ){
    }

    getNotification(limit:number,lastime:string|null,selectedNotificationType:string[]|null,selectedVehicle:number|null): Observable<Notification[]>{
        return new Observable<Notification[]>((observer) => {
            this.notificationService
                .getAllNotifications(
                    limit, lastime, selectedNotificationType, selectedVehicle
                )
                .subscribe(
                    (data) => {
                        this.notifications = data;

                        this.notifications.forEach((notification) => {

                            notification.eventtime= CommonUtils.formatDateTime(
                                notification.eventtime                     );                        });

                        observer.next(this.notifications); // Emit the notifications
                        observer.complete(); // Complete the observable
                    },
                    (error) => {
                        observer.error(error); // Emit an error if there's any
                    }
                );
        });
    }

    notificationData(limit:number,lastime:string|null,selectedNotificationType:string[]|null,selectedVehicle:number|null): Observable<Notification[]>{
        return new Observable<Notification[]>((observer) => {
            this.notificationService
                .getAllNotifications(
                    limit, lastime, selectedNotificationType, selectedVehicle
                )
                .subscribe(
                    (data) => {
                        this.notifications = data;

                        this.notifications.forEach((notification) => {
                            const latitude = notification.details.lat;
                            const longitude = notification.details.lng;

                            this.geocoder.getLocation(latitude, longitude).then((address) => {
                                notification.details.address = address; // Store the address in the report object
                            });
                            notification.eventtime= CommonUtils.formatDateTime(
                                notification.eventtime                     );
                        });

                        observer.next(this.notifications); // Emit the notifications
                        observer.complete(); // Complete the observable
                    },
                    (error) => {
                        observer.error(error); // Emit an error if there's any
                    }
                );
        });
    }


    deviceData(): Observable<Device[]>{
        return new Observable<Device[]>((observer) => {
            this.deviceService.getAllDevices().subscribe(

                (data) => {
                    this.devices = data;

                    observer.next(this.devices); // Emit the notifications
                    observer.complete(); // Complete the observable
                },
                (error) => {
                    observer.error(error); // Emit an error if there's any
                }
            );
        });
    }
}