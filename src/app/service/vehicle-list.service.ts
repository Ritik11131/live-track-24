import { Injectable, EventEmitter, Type } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Subject, of, map, Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { concatMap, catchError } from "rxjs/operators";

enum IconType {
  POWER = 1,
  AC = 2,
  TEMPERATURE = 3,
  DOOR = 4,
  BATTERY = 5,
  ENGINE = 6,
  GPS = 7,
  SPEED = 8,
  DISTANCE = 9,
  BATTERYPER = 10,
  IMMOBILIZER=11,
  SOC=12,
  WHEELLOCK=13,
  ODOMETER=14,
  IGNITION=15
}

export const R = {
  string: {
    ign_off: "assets/demo/images/vehicle-detail/ign_off.svg",
    ign_on: "assets/demo/images/vehicle-detail/ign_on.svg",
    engine_on: "assets/demo/images/vehicle-detail/engine_active.svg",
    engine_off: "assets/demo/images/vehicle-detail/engine_inactive.svg",
    temperature_on: "assets/demo/images/vehicle-detail/temp_active.svg",
    temperature_off: "assets/demo/images/vehicle-detail/temp_inactive.svg",
    temperature_null: "assets/demo/images/vehicle-detail/temp_null.svg",
    door_on: "assets/demo/images/vehicle-detail/door_active.svg",
    door_off: "assets/demo/images/vehicle-detail/door_inactive.svg",
    door_null: "assets/demo/images/vehicle-detail/door_null.svg",
    ac_on: "assets/demo/images/vehicle-detail/ac_active.svg",
    ac_off: "assets/demo/images/vehicle-detail/ac_inactive.svg",
    ac_null: "assets/demo/images/vehicle-detail/ac_null.svg",
    power_on: "assets/demo/images/vehicle-detail/power_active.svg",
    power_off: "assets/demo/images/vehicle-detail/power_inactive.svg",
    gps_on: "assets/demo/images/vehicle-detail/gps_active.svg",
    gps_off: "assets/demo/images/vehicle-detail/gps_inactive.svg",
    speed: "assets/demo/images/vehicle-detail/speed.svg",
    distance: "assets/demo/images/vehicle-detail/distance.svg",
    battery: "assets/demo/images/vehicle-detail/battery_high.svg",
    batteryPer_high: "assets/demo/images/vehicle-detail/batteryPer_high.svg",
    batteryPer_low: "assets/demo/images/vehicle-detail/batteryPer_low.svg",
    immobilizer_off: "assets/demo/images/vehicle-detail/immobilizer_off.svg",
    immobilizer_on: "assets/demo/images/vehicle-detail/immobolizer_on.svg",
    soc_low:"assets/demo/images/vehicle-detail/soc_low.png",
    soc_high:"assets/demo/images/vehicle-detail/soc_high.png",
    wheelLock_on:"assets/demo/images/vehicle-detail/wheel_lock_on.png",
    wheelLock_off:"assets/demo/images/vehicle-detail/wheel_lock_off.png",
    odometer:"assets/demo/images/vehicle-detail/odometer.svg"
  },
};

@Injectable({
  providedIn: "root",
})

export class VehicleListService {


  constructor(private client: HttpClient) {}


  private tripDataSubject = new Subject<{  deviceId: number,
    startDate :Date,
    endDate : Date}>();
  selectedDateRange!: string;
  private closeFormSubject = new Subject<boolean>();
  closeForm$ = this.closeFormSubject.asObservable();

  private closeDialogSubject = new Subject<boolean>();
  closeDialog$ = this.closeDialogSubject.asObservable();



  testDevideID!: number;
  private idData: BehaviorSubject<number | undefined> = new BehaviorSubject<
      number | undefined
  >(undefined);
  public data$: Observable<number | undefined> = this.idData.asObservable();
  removeMarkerSubject = new Subject<void>();

  selectedStartDate!: string;
  selectedEndDate!: string;
  private restrictDateRange: boolean = false;
  private restrictDateComponent: boolean = false;
  private refreshDetailPage = new Subject<void>();
  refreshDetailPage$ = this.refreshDetailPage.asObservable();

  refreshDetailPageCall() {
    this.refreshDetailPage.next();
  }
  dateRangeSelected: EventEmitter<{ startDate: string; endDate: string }> =
      new EventEmitter<{ startDate: string; endDate: string }>();

  getVehicleList(): Observable<any> {
    return this.client.get<any>(`${environment.url}/api/VehicleList`).pipe(
        map((res: any) => {
          return res["data"];
        })
    );
  }
  closeForm(close: boolean = false) {
    this.closeFormSubject.next(close);
  }
  closeDialogBox(close: boolean = false) {
    this.closeDialogSubject.next(close);
  }


  getVehicleById(id: number): Observable<any> {
    return this.client
        .get<any>(`${environment.url}/api/vehicleList/SearchByVehicle/${id}`)
        .pipe(
            map((res: any) => {
              return res["data"];
            })
        );
  }

  executeRemoveMarkerFunction(): void {
    this.removeMarkerSubject.next();
  }
  setOverSpeedLimit(payload: any): Observable<any> {
    return this.client
        .post<any>(`${environment.url}/api/device/SetOverSpeedLimit`, payload)
        .pipe(
            map((res: any) => {
              return res["data"];
            })
        );
  }
  updateSelectedDates(startDate: string, endDate: string) {
    this.selectedStartDate = startDate;
    this.selectedEndDate = endDate;
    this.dateRangeSelected.emit({
      startDate: this.selectedStartDate,
      endDate: this.selectedEndDate,
    });
  }
  sendtripData(data: any) {
    this.tripDataSubject.next(data);

  }
  receivetripData():Observable<{  deviceId: number,
    startDate :Date,
    endDate : Date}>{
    return this.tripDataSubject.asObservable()
  }




  immobilizerValue(
      deviceId: number | undefined,
      commandType:string,
      command:string | undefined = undefined,
  ): Observable<any> {
    let payload:any = {
      DeviceId: deviceId,
      commandType: commandType,
      token:"web"
    };
    if (command != undefined) {
      payload.command = command;
    }
    return this.client
        .post<any>(`${environment.url}/api/Commands/Immobilizer`, payload)
        .pipe(map((res: any) => {
          return res;
        }));
  }




  getCoordinate(
      deviceId: number | undefined,
      fromTime: string,
      toTime: string
  ): Observable<any> {
    const payload = {
      DeviceId: deviceId?.toString(),
      FromTime: fromTime,
      ToTime: toTime,
    };
    return this.client
        .post<any>(`${environment.url}/api/history`, payload)
        .pipe(
            catchError((error: any) => {
              console.error("Error occurred:", error);
              return of([]); // Return an empty array in case of error
            })
        );
  }

  getCoordinates(
      deviceId: number | undefined,
      startDate: string,
      endDate: string
  ): Observable<any[]> {
    // Initialize requests as an empty observable
    let requests: Observable<any[]> = of([]);
    const separator = startDate.includes("T") ? "T" : " ";
    const timeZoneMatch = startDate.match(/([-+]\d{2}:\d{2})$/);
    const timeZone = timeZoneMatch ? timeZoneMatch[0] : "+00:00";
    // Loop through each day between the start and end dates

    for (
        let currentDay = new Date(startDate);
        currentDay <= new Date(endDate);
        currentDay.setDate(currentDay.getDate() + 1)
    ) {
      let currentStartDate: Date;
      let currentEndDate: Date;
      if (new Date(startDate).toISOString().split('T')[0]===new Date(endDate).toISOString().split('T')[0]){
        currentStartDate = new Date(currentDay);
        currentEndDate = new Date(endDate);
      }else{
        currentStartDate = new Date(currentDay);
        currentEndDate = new Date(currentStartDate);
      }








      if (
          this.formatDate(currentStartDate, separator, timeZone) === startDate
      ) {
        const startTime = startDate.split(separator)[1].split("+")[0];
        const [hours, minutes, seconds] = startTime
            .split(":")
            .map((part) => parseInt(part));
        currentStartDate.setHours(hours, minutes, seconds);
      } else {
        // For other dates, set start time to 00:00:00
        currentStartDate.setHours(0, 0, 0);
      }

      // For the last date, use the provided end time
      if (this.formatDate(currentEndDate, separator, timeZone) === endDate) {
        const endTime = endDate.split(separator)[1].split("+")[0];
        const [hours, minutes, seconds] = endTime
            .split(":")
            .map((part) => parseInt(part));
        currentEndDate.setHours(hours, minutes, seconds);
      } else {
        // For other dates, set end time to 23:59:59
        currentEndDate.setHours(23, 59, 59);
      }

      // Format date strings in the required format (YYYY-MM-DD HH:mm:ss)
      const formattedStartDate = this.formatDate(
          currentStartDate,
          separator,
          timeZone
      );
      const formattedEndDate = this.formatDate(
          currentEndDate,
          separator,
          timeZone
      );

      // Append the current request to the existing requests
      requests = requests.pipe(
          concatMap((accumulatedData: any[]) =>
              this.getCoordinate(
                  deviceId,
                  formattedStartDate,
                  formattedEndDate
              ).pipe(
                  map((response) => {
                    // Check if response data is empty
                    if (response.data && response.data.length > 0) {
                      // Append data to accumulatedData
                      return accumulatedData.concat(response.data);
                    } else {
                      // Return accumulatedData unchanged if response data is empty
                      return accumulatedData;
                    }
                  }),
                  catchError((error) => {
                    // Handle error and return accumulatedData unchanged
                    console.error("Error occurred:", error);
                    return of(accumulatedData);
                  })
              )
          )
      );
    }

    return requests;
  }

  private formatDate(date: Date, separator: string, timeZone: string): string {
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const seconds = ("0" + date.getSeconds()).slice(-2);
    return `${year}-${month}-${day}${separator}${hours}:${minutes}:${seconds}${timeZone}`;
  }

  setData(data: number | undefined) {
    this.idData.next(data);
  }

  getDetailPageIcons(
      icon: number,
      type: number | null | undefined | Boolean
  ): string {

    switch (icon) {
      case IconType.POWER:
        return type === true ? R.string.engine_on : R.string.engine_off;

      case IconType.AC:
        return type === null
            ? R.string.ac_null
            : type === 1
                ? R.string.ac_on
                : R.string.ac_off;
      case IconType.TEMPERATURE:
        return type === null
            ? R.string.temperature_null
            : type === 1
                ? R.string.temperature_on
                : R.string.temperature_off;
      case IconType.DOOR:
        return type === null
            ? R.string.door_null
            : type === 1
                ? R.string.door_on
                : R.string.door_off;
      case IconType.BATTERY:
        return R.string.battery;
      case IconType.BATTERYPER:
        return typeof type === "number" && type >= 50
            ? R.string.batteryPer_high
            : R.string.batteryPer_low;
      case IconType.SOC:
        return typeof type === "number" && type >= 40
            ? R.string.soc_high
            : R.string.soc_low;
      case IconType.IMMOBILIZER:
        return  type === true
            ? R.string.immobilizer_on
            : R.string.immobilizer_off;
      case IconType.WHEELLOCK:
        return  type === true
            ? R.string.wheelLock_off
            : R.string.wheelLock_on;

      case IconType.GPS:
        return type === 1 ? R.string.gps_on : R.string.gps_off;
      case IconType.IGNITION:

        return type === true ? R.string.ign_on : R.string.ign_off;
      case IconType.SPEED:
        return R.string.speed;
      case IconType.DISTANCE:
        return R.string.distance;
      case IconType.ODOMETER:
        return R.string.odometer;
      default:
        return ""; // Or handle default case as per your requirement
    }
  }

  setRestrictDateRange(restrictRange: boolean,restrictComponent:boolean) {
    this.restrictDateRange = restrictRange;
    this.restrictDateComponent=restrictComponent
  }

  getRestrictDateRange() {
    return {
      restrictDateRange: this.restrictDateRange,
      restrictDateComponent: this.restrictDateComponent
    };
  }
}
