import { Injectable, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { Subject, Observable, map } from 'rxjs';
import { CreatePlanComponent } from '../presenter/create-plan/create-plan.component';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class CreatePlanService {

  private dialogResult = new Subject<string | null>();
  private dialogComponentRef?: ComponentRef<CreatePlanComponent>;

  constructor( private client: HttpClient,private componentFactoryResolver: ComponentFactoryResolver,) {}

  open(viewContainerRef: ViewContainerRef,title:string,id:number,userId:number): Observable<string | null> {
    if (this.dialogComponentRef) {
      this.dialogComponentRef.destroy();  // Ensure any existing dialog is destroyed
    }

    const factory = this.componentFactoryResolver.resolveComponentFactory(CreatePlanComponent);
    this.dialogComponentRef = viewContainerRef.createComponent(factory);
    this.dialogComponentRef.instance.title = title;

    this.dialogComponentRef.instance.id = id;
    this.dialogComponentRef.instance.userId = userId;

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
  createCustomerPlan(payload:any): Observable<string> {
    return this.client.post<string>(`${environment.url}/api/Billing/CustomerPlan`,payload).pipe(
      map((res: any) => {
        return res["data"];
      })
    );
  }

  updateCustomerPlan(payload:any): Observable<string> {
    return this.client.put<string>(`${environment.url}/api/Billing/CustomerPlan/${payload.id}`,payload).pipe(
      map((res: any) => {
        return res["data"];
      })
    );
  }

}
