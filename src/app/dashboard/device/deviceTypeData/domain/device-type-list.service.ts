import { Injectable, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { Subject, Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DeviceTypeListComponent } from '../presenter/device-type-list/device-type-list.component';
import { HttpClient } from '@angular/common/http';
import { VehicleType } from 'src/app/models/vehicleType';
import { DeviceType } from 'src/app/models/deviceType';
@Injectable({
  providedIn: 'root'
})
export class DeviceTypeService{

  private dialogResult = new Subject<string | null>();
  private DeviceTypeListRef?: ComponentRef<DeviceTypeListComponent>;

  constructor(private client: HttpClient,private componentFactoryResolver: ComponentFactoryResolver,) {}

  open(viewContainerRef: ViewContainerRef): Observable<string | null> {
    if (this.DeviceTypeListRef) {
      this.DeviceTypeListRef.destroy();  // Ensure any existing dialog is destroyed
    }

    const factory = this.componentFactoryResolver.resolveComponentFactory(DeviceTypeListComponent);
    this.DeviceTypeListRef = viewContainerRef.createComponent(factory);

    return this.dialogResult.asObservable();
  }

  close(result: string | null) {
    this.dialogResult.next(result);
    this.dialogResult.complete();  // Close the observable stream
    this.dialogResult = new Subject<string | null>();  // Reset the Subject to be ready for new data

    if (this.DeviceTypeListRef) {
      this.DeviceTypeListRef.destroy();  // Destroy the dialog component
      this.DeviceTypeListRef = undefined;  // Clean up the reference
    }
  }
  getDeviceType(): Observable<DeviceType[]> {
    return this.client.get(`${environment.url}/api/Masters/DeviceType`).pipe(
      map((res: any) => {

        return res["data"];
      })
    );
  }
}
