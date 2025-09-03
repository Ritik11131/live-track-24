import { Injectable, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { map, Subject,Observable } from "rxjs";
import { OverSpeedDialogComponent } from "../dashboard/vehicleTracking/setOverSpeed/over-speed-dialog/over-speed-dialog.component";
import { environment } from "src/environments/environment";
@Injectable({
    providedIn: 'root'
  })
export class OverSpeedDialogViewModel {

    private dialogResult = new Subject<string | null>();
    private overSpeedDialogComponentRef?: ComponentRef<OverSpeedDialogComponent>;
  
    constructor(private client :HttpClient,private componentFactoryResolver: ComponentFactoryResolver) {}
  
    open(viewContainerRef: ViewContainerRef, deviceId:number): Observable<string | null> {
      if (this.overSpeedDialogComponentRef) {
        this.overSpeedDialogComponentRef.destroy();  // Ensure any existing dialog is destroyed
      }
  
      const factory = this.componentFactoryResolver.resolveComponentFactory(OverSpeedDialogComponent);
      this.overSpeedDialogComponentRef = viewContainerRef.createComponent(factory);
      this.overSpeedDialogComponentRef.instance.deviceId = deviceId;

  
  
      return this.dialogResult.asObservable();
    }
  
    close(result: string | null) {
      this.dialogResult.next(result);
      this.dialogResult.complete();  // Close the observable stream
      this.dialogResult = new Subject<string | null>();  // Reset the Subject to be ready for new data
  
      if (this.overSpeedDialogComponentRef) {
        this.overSpeedDialogComponentRef.destroy();  // Destroy the dialog component
        this.overSpeedDialogComponentRef = undefined;  // Clean up the reference
      }
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
}