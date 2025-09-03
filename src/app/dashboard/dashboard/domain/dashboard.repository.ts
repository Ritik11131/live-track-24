import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MessageService } from "primeng/api";
import { NotificationService } from "../../notifications/domain/notification.service";
import { VehicleListService } from "src/app/service/vehicle-list.service";
import { VehicleDetailMapperService } from "src/app/service/vehicle-detail-mapper.service";
import { CommonUtils } from "src/app/utils/commonUtils";
import { Observable } from "rxjs";
import { NotificationData } from "./notificationdata.model"
@Injectable()
export class dashboardRepository {
  notificationChartData!: NotificationData;
  constructor(
    private positionReport: VehicleDetailMapperService,
    private vehicleListRepo: VehicleListService,
    private notificationService: NotificationService,
    private messageService: MessageService,
    private httpClient: HttpClient
  ) {
    CommonUtils.init(httpClient, messageService);
  }

  getNoficationData(): Observable<NotificationData> {
    this.notificationChartData = {
      GeofenceEnter: 0,
      GeofenceExit: 0,
      IgnitionOn: 0,
      IgnitionOff: 0,
      PowerCut: 0,
      PowerRestored: 0,
      Overspeed: 0,
      Parking: 0,
    };
    console.log("81")
    return new Observable<NotificationData>((observer) => {
      const currentDate = new Date();

      const currentDateString = CommonUtils.addTimeZone(
        new Date(currentDate.setHours(0, 0, 0)).toISOString()
      );
      this.notificationService.fetchDataForCurrentDay().subscribe(
        (data) => {
          // Iterate over the notifications data array
          data.forEach((notification) => {
            if (notification.eventtime > currentDateString) {
              switch (notification.type) {
                case "geofenceEnter":
                  this.notificationChartData.GeofenceEnter++;
                  break;
                case "geofenceExit":
                  this.notificationChartData.GeofenceExit++;
                  break;
                case "ignitionOn":
                  this.notificationChartData.IgnitionOn++;
                  break;
                case "ignitionOff":
                  this.notificationChartData.IgnitionOff++;
                  break;
                case "powerCut":
                  this.notificationChartData.PowerCut++;
                  break;
                case "powerRestored":
                  this.notificationChartData.PowerRestored++;
                  break;
                case "overspeed":
                  this.notificationChartData.Overspeed++;
                  break;
                case "parking":
                  this.notificationChartData.Parking++;
                  break;
                default:
                  // Handle unknown notification types
                  break;
              }
            } // Check the type of each notification and update the corresponding count
          });
          observer.next(this.notificationChartData); // Emit the notifications
          observer.complete(); // Complete the observable
        },
        (error) => {
          observer.error(error); // Emit an error if there's any
        }
      );
    });
  }

  getVehicleData(): Observable<any> {
    return new Observable<any>((observer) => {
      this.vehicleListRepo.getVehicleList().subscribe(
        (data: any) => {
          const details = this.positionReport.getSummary(data);

          observer.next(details); // Emit the notifications
          observer.complete(); // Complete the observable
        },
        (error: any) => {
          observer.error(error); // Emit an error if there's any
        }
      );
    });
  }
}
