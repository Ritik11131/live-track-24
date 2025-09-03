import { Injectable, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { map, Subject,Observable } from "rxjs";
import { DatePickerComponent } from '../dashboard/commonComponents/datePicker/date-picker/date-picker.component';
import { environment } from "src/environments/environment";
@Injectable({
    providedIn: 'root'
  })
export class DatePickerViewModel {

    private dialogResult = new Subject<string | null>();
    private datePickerComponentRef?: ComponentRef<DatePickerComponent>;
  
    constructor(private client :HttpClient,private componentFactoryResolver: ComponentFactoryResolver) {}
  
    open(viewContainerRef: ViewContainerRef, restrictDateRange:boolean): Observable<string | null> {
      if (this.datePickerComponentRef) {
        this.datePickerComponentRef.destroy();  // Ensure any existing dialog is destroyed
      }
  
      const factory = this.componentFactoryResolver.resolveComponentFactory(DatePickerComponent);
      this.datePickerComponentRef = viewContainerRef.createComponent(factory);
      this.datePickerComponentRef.instance.restrictDateRange = restrictDateRange;

  
  
      return this.dialogResult.asObservable();
    }
  
    close(result: string | null) {
      this.dialogResult.next(result);
      this.dialogResult.complete();  // Close the observable stream
      this.dialogResult = new Subject<string | null>();  // Reset the Subject to be ready for new data
  
      if (this.datePickerComponentRef) {
        this.datePickerComponentRef.destroy();  // Destroy the dialog component
        this.datePickerComponentRef = undefined;  // Clean up the reference
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