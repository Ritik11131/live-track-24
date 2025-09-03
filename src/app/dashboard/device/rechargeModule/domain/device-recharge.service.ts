import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  Injectable,
  ViewContainerRef,
  ComponentFactoryResolver,
  ComponentRef,
} from "@angular/core";
import { Subject, Observable, map } from "rxjs";
import { DeviceRechargeComponent } from '../presenter/device-recharge/device-recharge.component';
@Injectable({
  providedIn: 'root'
})
export class DeviceRechargeService {
  private dialogResult = new Subject<string | null>();
  private dialogComponentRef?: ComponentRef<DeviceRechargeComponent>;
  constructor(private client: HttpClient,    private componentFactoryResolver: ComponentFactoryResolver
  ) {}


  open(
    viewContainerRef: ViewContainerRef,
    deviceId: number,
    nextRechargeDate:string
  ): Observable<string | null> {
    if (this.dialogComponentRef) {
      this.dialogComponentRef.destroy(); // Ensure any existing dialog is destroyed
    }

    const factory = this.componentFactoryResolver.resolveComponentFactory(
        DeviceRechargeComponent
    );
    console.log(deviceId,nextRechargeDate)

    this.dialogComponentRef = viewContainerRef.createComponent(factory);
    this.dialogComponentRef.instance.deviceId = deviceId;
    this.dialogComponentRef.instance.date = new Date(nextRechargeDate);

    return this.dialogResult.asObservable();
  }

  close(result: string | null) {
    this.dialogResult.next(result);
    this.dialogResult.complete(); // Close the observable stream
    this.dialogResult = new Subject<string | null>(); // Reset the Subject to be ready for new data

    if (this.dialogComponentRef) {
      this.dialogComponentRef.destroy(); // Destroy the dialog component
      this.dialogComponentRef = undefined; // Clean up the reference
    }
  }

  setNextValidity(payload:any):Observable<any>{
      
    return this.client
        .put<any>(`${environment.url}/api/DeviceValidity/${payload.fkDeviceId}`, payload)
        .pipe(
            map((res: any) => {
                return res["data"];
            })
        );    }
}
