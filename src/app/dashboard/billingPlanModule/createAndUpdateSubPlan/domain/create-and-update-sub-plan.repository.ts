import { Injectable } from "@angular/core";
import { CreateAndUpdateSubPlanService } from "./create-and-update-sub-plan.service";
import { Observable } from "rxjs";


@Injectable()
export class createAndUpdateSubPlanRepository {

    constructor(
        public createAndUpdateSubPlanService: CreateAndUpdateSubPlanService,

      ) {
      }

      updateCustomerSubPlan(payload:any): Observable<string> {
        return new Observable<string>((observer) => {
          this.createAndUpdateSubPlanService.updateCustomerSubPlan(payload).subscribe(
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

      createCustomerSubPlan(payload:any): Observable<any> {
        return new Observable<any>((observer) => {
          this.createAndUpdateSubPlanService.createCustomerSubPlan(payload).subscribe(
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