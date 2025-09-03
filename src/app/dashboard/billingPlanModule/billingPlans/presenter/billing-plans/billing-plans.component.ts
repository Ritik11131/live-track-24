import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { Table, TableModule } from "primeng/table";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SkeletonModule } from "primeng/skeleton";
import { ToastModule } from "primeng/toast";
import { ButtonModule } from "primeng/button";
import { CreatePlanService } from "../../../createPlan/domain/create-plan.service";
import { InputTextModule } from "primeng/inputtext";
import { BillingPlanRepository } from "../../domain/billing-plans.repository";
import { BillingPlan } from "../../domain/billingPlan.model";
import { ConfirmationDialogService } from "src/app/dashboard/commonComponents/confirmationDialog/domain/confirmation-dialog.service";
import { SubPlan } from "../../domain/subPlan.model";
import { CreateAndUpdateSubPlanService } from "../../../createAndUpdateSubPlan/domain/create-and-update-sub-plan.service";
@Component({
  selector: "app-billing-plans",
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    TableModule,
    ToastModule,
    CommonModule,
    SkeletonModule,
    FormsModule,
  ],
  templateUrl: "./billing-plans.component.html",
  styleUrl: "./billing-plans.component.scss",
  providers: [BillingPlanRepository],
})
export class BillingPlansComponent implements OnInit {
  billingPLans!: BillingPlan[];
  billingData: boolean = false;
  subPlanData: boolean = false;
  subPlans: { [planId: string]: SubPlan[] } = {};
  selectPlan: any;
  visibleDropdown: number | null = null; // Tracks which dropdown is visible
  visiblesubPlanDropdown: number | null = null;
  constructor(
    private confirmationDialogService: ConfirmationDialogService,
    private createPlanService: CreatePlanService,
    private billingPlanRepo: BillingPlanRepository,
    private viewContainerRef: ViewContainerRef,
    private createAndUpdateSubPlanService: CreateAndUpdateSubPlanService
  ) {}
  ngOnInit(): void {
    this.getCustomerPlan();
  }
  getCustomerPlan() {
    this.billingPlanRepo.getCustomerPlan().subscribe(
      (data: BillingPlan[]) => {
        this.billingPLans = data;
        this.billingData = true;
      },
      (error) => {
        this.billingData = true;
      }
    );
  }
  toggleList(index: number) {
    this.visibleDropdown = this.visibleDropdown === index ? null : index;
  }
  toggleSubPlanList(index: number) {
    this.visiblesubPlanDropdown =
      this.visiblesubPlanDropdown === index ? null : index;
  }
  toggleRow(rowUser: any): void {
    console.log("getting called");
    this.selectPlan = rowUser;
    this.visibleDropdown = null;
    this.billingPlanRepo.getCustomerSubPlan(rowUser.id).subscribe((data) => {
      this.subPlans[rowUser.id] = data;
      console.log(this.subPlans[rowUser.id]);
      this.subPlanData = true;
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, "contains");
  }

  onDropDownGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, "contains");
  }

  createCustomerPlan() {
    this.createPlanService
      .open(this.viewContainerRef,"Create Plan", 0, 0)
      .subscribe((result) => {
        if (result == "yes") {
          // debugger;
          this.getCustomerPlan();
        } else {
          console.log("Dialog was cancelled");
        }
      });
  }

  updateCustomerPlan(rowUser: any) {
    this.visibleDropdown = null;

    this.createPlanService
      .open(this.viewContainerRef, "Update Plan",rowUser.id, rowUser.userId)
      .subscribe((result) => {
        if (result == "yes") {
          // debugger;
          this.getCustomerPlan();
        } else {
          console.log("Dialog was cancelled");
        }
      });
  }

  deleteCustomerPlan(id: number) {
    this.billingPlanRepo.deleteCustomerPlan(id).subscribe(
      (data) => {
        console.log(data);
        this.getCustomerPlan();
      },
      (error: any) => {
        console.log(error);
        this.getCustomerPlan();

      }
    );
  }
  delete(id: number) {
    this.visibleDropdown = null;

    this.confirmationDialogService
      .open(this.viewContainerRef, "DELETE")
      .subscribe((result) => {
        if (result == "yes") {
          // debugger;
          this.deleteCustomerPlan(id);
        } else {
          console.log("Dialog was cancelled");
        }
      });
  }
  createCustomerSubPlan(rowUser: any) {
    this.createAndUpdateSubPlanService
      .open(this.viewContainerRef, "Create New Plan Category", 0, rowUser.id)
      .subscribe((result) => {
        if (result == "yes") {
          this.toggleRow(this.selectPlan)
        } else {
          console.log("Dialog was cancelled");
        }
      });
  }
  updateCustomerSubPlan(subPlan: any) {
    this.visiblesubPlanDropdown = null;
    this.createAndUpdateSubPlanService
      .open(
        this.viewContainerRef,
        "Update Plan Category",
        subPlan.durations.id,
        subPlan.durations.planId
      )
      .subscribe((result) => {
        if (result == "yes") {
          this.toggleRow(this.selectPlan);
        } else {
          console.log("Dialog was cancelled");
        }
      });
  }
  deleteSubPlan(id: number) {
    this.visiblesubPlanDropdown = null;

    this.confirmationDialogService
      .open(this.viewContainerRef, "DELETE")
      .subscribe((result) => {
        if (result == "yes") {
          // debugger;
          this.deleteCustomerSubPlan(id);
        } else {
          console.log("Dialog was cancelled");
        }
      });
  }
  deleteCustomerSubPlan(id: number) {
    this.billingPlanRepo.deleteCustomerSubPlan(id).subscribe(
      (data) => {
        console.log(data);
        this.toggleRow(this.selectPlan);
      },
      (error: any) => {
        console.log(error);
        this.toggleRow(this.selectPlan);

      }
    );
  }
}
