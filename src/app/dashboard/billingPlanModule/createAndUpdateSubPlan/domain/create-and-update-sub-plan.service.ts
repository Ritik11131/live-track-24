import { Injectable, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { Subject, Observable, map } from 'rxjs';
import { CreateAndUpdateSubPlanComponent } from '../presenter/create-and-update-sub-plan/create-and-update-sub-plan.component';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class CreateAndUpdateSubPlanService {

  private dialogResult = new Subject<string | null>();
  private dialogComponentRef?: ComponentRef<CreateAndUpdateSubPlanComponent>;

  constructor( private client: HttpClient,private componentFactoryResolver: ComponentFactoryResolver,) {}

  open(viewContainerRef: ViewContainerRef,title:string,id:number,planId:number): Observable<string | null> {
    if (this.dialogComponentRef) {
      this.dialogComponentRef.destroy();  // Ensure any existing dialog is destroyed
    }

    const factory = this.componentFactoryResolver.resolveComponentFactory(CreateAndUpdateSubPlanComponent);
    this.dialogComponentRef = viewContainerRef.createComponent(factory);
    this.dialogComponentRef.instance.title = title;

    this.dialogComponentRef.instance.id = id;
    this.dialogComponentRef.instance.planId = planId;

    return this.dialogResult.asObservable();
  }

  close(result: string | null) {
    this.dialogResult.next(result);
    this.dialogResult.complete();  // Close the observable stream
    this.dialogResult = new Subject<string | null>();  // Reset the Subject to be ready for new data

    if (this.dialogComponentRef) {
      this.dialogComponentRef.destroy();  // Destroy the dialog component
      this.dialogComponentRef = undefined;  // Clean up the reference
    }
  }
  updateCustomerSubPlan(payload:any): Observable<string> {
    return this.client.put<string>(`${environment.url}/api/Billing/CustomerPlanDuration/${payload.id}`,payload).pipe(
      map((res: any) => {
        return res["data"];
      })
    );
  }
  
  createCustomerSubPlan(payload:any): Observable<any> {
    return this.client.post<any>(`${environment.url}/api/Billing/CustomerPlanDuration`,payload).pipe(
      map((res: any) => {
        return res["data"];
      })
    );
  }
  

}
