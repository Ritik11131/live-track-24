import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BillingPlan } from './billingPlan.model';
import { SubPlan } from './subPlan.model';
@Injectable({
  providedIn: 'root'
})
export class BillingPlansService {

  constructor(private client: HttpClient) {
  }


  getCustomerPlan(): Observable<BillingPlan[]> {
    return this.client.get<BillingPlan[]>(`${environment.url}/api/Billing/CustomerPlan`).pipe(
      map((res: any) => {
        return res["data"];
      })
    );
  }




  deleteCustomerPlan(id:number): Observable<string> {
    return this.client.delete<string>(`${environment.url}/api/Billing/CustomerPlan/${id}`).pipe(
      map((res: any) => {
        return res["data"];
      })
    );
  }

  getCustomerPlanById(id :number): Observable<string> {
    return this.client.get<string>(`${environment.url}/api/Billing/CustomerPlan/${id}`).pipe(
      map((res: any) => {
        return res["data"];
      })
    );
  }
// ######################  SUB PLANS ############################

getCustomerSubPlan(id :number): Observable<SubPlan[]> {
  return this.client.get<SubPlan[]>(`${environment.url}/api/Billing/CustomerPlanDuration/${id}`).pipe(
    map((res: any) => {
      return res["data"];
    })
  );
}
deleteCustomerSubPlan(id:number): Observable<string> {
  return this.client.delete<string>(`${environment.url}/api/Billing/CustomerPlanDuration/${id}`).pipe(
    map((res: any) => {
      return res["data"];
    })
  );
}





}
