import { Injectable } from "@angular/core";
import { CreatePlanService } from "./create-plan.service";
import { Observable } from "rxjs";
import { BillingPlansService } from "../../billingPlans/domain/billing-plans.service";
@Injectable()
export class CreatePlanRepository {
    constructor(
        private createPlanService: CreatePlanService,

    ) {}
    createCustomerPlan(payload:any): Observable<string> {
        return new Observable<string>((observer) => {
          this.createPlanService.createCustomerPlan(payload).subscribe(
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
      updateCustomerPlan(payload:any): Observable<string> {
        return new Observable<string>((observer) => {
          this.createPlanService.updateCustomerPlan(payload).subscribe(
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
