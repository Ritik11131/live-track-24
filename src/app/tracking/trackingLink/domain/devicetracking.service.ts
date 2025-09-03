import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  Injectable,
  ViewContainerRef,
  ComponentFactoryResolver,
  ComponentRef,
} from "@angular/core";
import { Subject, Observable, map } from "rxjs";
import { DeviceTrackingLinkComponent } from "../presenter/device-tracking-link/device-tracking-link.component";
@Injectable({
  providedIn: 'root'
})
export class DevicetrackingService {
  private dialogResult = new Subject<string | null>();
  private dialogComponentRef?: ComponentRef<DeviceTrackingLinkComponent>;
  constructor(private client: HttpClient,    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  generateTrackingLink(payload: any): Observable<any> {
    return this.client
      .post<any>(`${environment.url}/api/ShareUrl`, payload)
      .pipe(
        map((res: any) => {
          return res["data"];
        })
      );
  }
  open(
    viewContainerRef: ViewContainerRef,
    deviceId: number
  ): Observable<string | null> {
    if (this.dialogComponentRef) {
      this.dialogComponentRef.destroy(); // Ensure any existing dialog is destroyed
    }

    const factory = this.componentFactoryResolver.resolveComponentFactory(
        DeviceTrackingLinkComponent
    );
    this.dialogComponentRef = viewContainerRef.createComponent(factory);
    this.dialogComponentRef.instance.deviceId = deviceId;

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
}
