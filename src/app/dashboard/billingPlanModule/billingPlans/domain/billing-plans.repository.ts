import { Injectable } from "@angular/core";
import { BillingPlansService } from "./billing-plans.service";
import { Observable } from "rxjs";
import { BillingPlan } from './billingPlan.model';
import { SubPlan } from "./subPlan.model";

@Injectable()
export class BillingPlanRepository {

    constructor(
        public billingPlansService: BillingPlansService,

      ) {
      }

      getCustomerPlan(): Observable<BillingPlan[]> {
        return new Observable<BillingPlan[]>((observer) => {
          this.billingPlansService.getCustomerPlan().subscribe(
            (data) => {
              observer.next(data); // Emit the notifications
              observer.complete(); // Complete the observable
            },
            (error) => {
              observer.error(error); // Emit an error if there's any
            }
          );
        });
      }


  



      deleteCustomerPlan(id:number): Observable<string> {
        return new Observable<string>((observer) => {
          this.billingPlansService.deleteCustomerPlan(id).subscribe(
            (data) => {
              observer.next(data); // Emit the notifications
              observer.complete(); // Complete the observable
            },
            (error) => {
              observer.error(error); // Emit an error if there's any
            }
          );
        });
      }


      getCustomerPlanById(id:number): Observable<string> {
        return new Observable<string>((observer) => {
          this.billingPlansService.getCustomerPlanById(id).subscribe(
            (data) => {
              observer.next(data); // Emit the notifications
              observer.complete(); // Complete the observable
            },
            (error) => {
              observer.error(error); // Emit an error if there's any
            }
          );
        });
      }
      getCustomerSubPlan(id:number): Observable<SubPlan[]> {
        return new Observable<SubPlan[]>((observer) => {
          this.billingPlansService.getCustomerSubPlan(id).subscribe(
            (data) => {
              observer.next(data); // Emit the notifications
              observer.complete(); // Complete the observable
            },
            (error) => {
              observer.error(error); // Emit an error if there's any
            }
          );
        });
      }

      // ######################  SUB PLANS ############################


      deleteCustomerSubPlan(id:number): Observable<string> {
        return new Observable<string>((observer) => {
          this.billingPlansService.deleteCustomerSubPlan(id).subscribe(
            (data) => {
              observer.next(data); // Emit the notifications
              observer.complete(); // Complete the observable
            },
            (error) => {
              observer.error(error); // Emit an error if there's any
            }
          );
        });
      }

   
    }