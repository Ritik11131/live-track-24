import { Injectable, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { Subject, Observable ,map} from 'rxjs';
import { Device } from 'src/app/models/device';
import { HttpClient } from '@angular/common/http';
import { LinkMultipleDeviceComponent } from '../presenter/link-multiple-device/link-multiple-device.component';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class LinkMultipleDeviceService {
  private linkMulDevicedialogResult = new Subject<string | null>();
  private linkMulDeviceComponentRef?: ComponentRef<LinkMultipleDeviceComponent>;
  constructor(private client:HttpClient,private componentFactoryResolver: ComponentFactoryResolver) {}
  open(viewContainerRef: ViewContainerRef,title:string, devices: Device[]): Observable<string | null> {
    if (this.linkMulDeviceComponentRef) {
      this.linkMulDeviceComponentRef.destroy();  // Ensure any existing dialog is destroyed
    }

    const factory = this.componentFactoryResolver.resolveComponentFactory(LinkMultipleDeviceComponent);
    this.linkMulDeviceComponentRef = viewContainerRef.createComponent(factory);
    this.linkMulDeviceComponentRef.instance.devices = devices;

    this.linkMulDeviceComponentRef.instance.title = title;

    return this.linkMulDevicedialogResult.asObservable();
  }

  close(result: string | null) {
    this.linkMulDevicedialogResult.next(result);
    this.linkMulDevicedialogResult.complete();  // Close the observable stream
    this.linkMulDevicedialogResult = new Subject<string | null>();  // Reset the Subject to be ready for new data

    if (this.linkMulDeviceComponentRef) {
      this.linkMulDeviceComponentRef.destroy();  // Destroy the dialog component
      this.linkMulDeviceComponentRef = undefined;  // Clean up the reference
    }
  }
linkPlans(payload:any){

  return this.client.post<string>(`${environment.url}/api/Billing/LinkPlan`,payload).pipe(
    map((res: any) => {
      return res["data"];
    })
  );}

}
