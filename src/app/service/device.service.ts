import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject,Subject, map, Observable ,forkJoin} from "rxjs";
import { Device } from "../models/device";
import { environment } from "src/environments/environment";
import { OperatorType } from "../models/operatorType";
import { DeviceType } from "../models/deviceType";
import { VehicleType } from "../models/vehicleType";
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: "root",
})
export class DeviceService {

  // private deviceCreated: boolean = false;

  private addUserbuttonClickSubject = new Subject<void>();
  addUserbuttonClick$ = this.addUserbuttonClickSubject.asObservable();

  private customerDeviceUpdatedSubject = new Subject<void>();
  customerDeviceUpdated$ = this.customerDeviceUpdatedSubject.asObservable();

  private currentDeviceData = new BehaviorSubject<{ uniqueId: any, deviceId: any }>({ uniqueId: null, deviceId: null });
  currentValues = this.currentDeviceData.asObservable();

  private deviceId = new BehaviorSubject<{  deviceId: any }>({ deviceId: null });
  idValue = this.deviceId.asObservable();
  private deviceImeiSource = new BehaviorSubject<String | null>(null); // Changed to BehaviorSubject
  currentDeviceImei = this.deviceImeiSource.asObservable();

 

  constructor(private client: HttpClient) {
    this.getOperatorType().subscribe()
    this.getDeviceType().subscribe()
    this.getVehicleType().subscribe()
  }

 


  // setDeviceCreated(status: boolean): void {
  //   this.deviceCreated = status;
  // }

  // isDeviceCreated(): boolean {
  //   return this.deviceCreated;
  // }

  operatorType!:OperatorType[];
  deviceType!:DeviceType[];
  vehicleType!:VehicleType[];

  // deviceTypes = [{ label: "GRL", value: 1 }];
  // vehicleTypes = [
  //   { label: "Car", value: 1 },
  //   { label: "Bus", value: 2 },
  //   { label: "Truck", value: 3 },
  // ];
  // operatorTypes = [
  //   { label: "BSNL", value: 1 },
  //   { label: "Airtel", value: 2 },
  //   { label: "Idea", value: 3 },
  // ];
  changeDeviceImei(deviceImei: string) {
    this.deviceImeiSource.next(deviceImei);
  }
  getVehicleTypeLabel(fkVehicleType: number): string {
    
    const vehicle = this.vehicleType.find((v) => v.id === fkVehicleType);
    return vehicle ? vehicle.name : "Unknown";
  }

  getOperatorTypeLabel(fkSimOperator: number): string {
    const vehicle = this.operatorType.find((v) => v.id === fkSimOperator);
    return vehicle ? vehicle.name : "Unknown";
  }

  getDeviceTypeLabel(fkDeviceType: number): string {
    const vehicle = this.deviceType.find((v) => v.id === fkDeviceType);
    return vehicle ? vehicle.name : "Unknown";
  }
  createDevice(device: Device,userId:number): Observable<Device> {
    let url = `${environment.url}/api/device`
    console.log(userId)
    if(userId != 0) url+= `/${userId}`
    return this.client
        .post<Device>(url, device)
        .pipe(
            map((res: any) => {
              return res["Data"];
            })
        );
  }
  createBulkDevice(devices: any[],userId:number): Observable<string[]> {
    let url = `${environment.url}/api/device`
    const requests: Observable<string>[] = [];
    if(userId != 0) url+= `/${userId}`

    devices.forEach(device => {
      const request = this.client.post<Device>(url, device)
        .pipe(
          map((res: any) => res["Data"])
        );
      requests.push(request);
    });
  
    return forkJoin(requests);
  }
  getAllDevices(): Observable<Device[]> {
    return this.client.get<Device[]>(`${environment.url}/api/device`).pipe(
      map((res: any) => {
        return res["data"];
      })
    );
  }


  getOperatorType(): Observable<OperatorType[]> {
    return this.client.get(`${environment.url}/api/Masters/OperatorType`).pipe(
      map((res: any) => {
        this.operatorType=res['data']
        return res["data"];
      })
    );
  }
  getDeviceType(): Observable<DeviceType[]> {
    return this.client.get(`${environment.url}/api/Masters/DeviceType`).pipe(
      map((res: any) => {
        this.deviceType=res['data']

        return res["data"];
      })
    );
  }
  getVehicleType(): Observable<VehicleType[]> {
    return this.client.get(`${environment.url}/api/Masters/VehicleType`).pipe(
      map((res: any) => {
        this.vehicleType=res['data']

        return res["data"];
      })
    );
  }
  
  emitAddUserButtonClick() {
    this.addUserbuttonClickSubject.next();
  }
  customerDeviceUpdated() {
    this.customerDeviceUpdatedSubject.next();
  }
getUserDevices(id: number): Observable<Device[]> {
  return this.client
    .get<Device[]>(`${environment.url}/api/device/GetByUserId/${id}`)
    .pipe(
      map((res: any) => {
        return res["data"];
      })
    );
}


  getDeviceList(customerId: number): Observable<Device[]> {
    return this.client
      .get<Device[]>(`${environment.url}/api/device/GetByUserId/${customerId}`)
      .pipe(
        map((res: any) => {
          return res["data"];
        })
      );
  }

  updateDevice(id: number, value: Device): Observable<Device> {
    return this.client.put(`${environment.url}/api/device/${id}`, value).pipe(
      map((res: any) => {
        return res["Data"];
      })
    );
  }

  searchImei(id: number): Observable<any> {
    return this.client
      .get(`${environment.url}/api/device/${id}`)
      .pipe(
        filter(res => !!res), // Filter out falsy values (null, undefined, etc.)
        map((res: any) => {
         
          return res["data"];
        }))
  }

  deleteDevices(id: number): Observable<any> {
    return this.client.delete(`${environment.url}/api/device/${id}`);
  }

  getUserListByDeviceId(deviceId: string) {
    return this.client
      .get(
        `${environment.url}/api/DeviceMapping/GetUserListByDeviceId/${deviceId}`
      )
      .pipe(
        map((res: any) => {
          return res["data"];
        })
      );
  }

  unLinkUser(
    mappingId: number,
    deviceId: number,
    userId: number
  ): Observable<any> {
    // Prepare the request payload
    const payload = {
      mappingId: mappingId,
      deviceId: deviceId,
      userId: userId,
    };

    // Make the API call
    return this.client
      .post<any>(`${environment.url}/api/DeviceMapping/UnlinkMapping`, payload)
      .pipe(
        map((res: any) => {
          return ;
        })
      );
  }


  passData(uniqueId:number,deviceId: number){
this.currentDeviceData.next({uniqueId,deviceId})
  }
  passDeviceId(deviceId: number){
    this.deviceId.next({deviceId})
      }
  linkUser(userId:any[],deviceId:number): Observable<any>{
    const payload = {
    userId:userId,
    deviceId:deviceId
    };
    // Make the API call
    return this.client
      .post<any>(`${environment.url}/api/DeviceMapping/CreateMapping`, payload)
      .pipe(
        map((res: any) => {
          return ;
        })
      );
  }
}
