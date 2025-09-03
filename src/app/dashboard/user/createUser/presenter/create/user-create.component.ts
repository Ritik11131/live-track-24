import { Component, OnInit } from "@angular/core";
// import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import * as moment from "moment";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UserService } from "../../../services/user.service";
import { finalize } from "rxjs";
import { ConfirmationService, MessageService } from "primeng/api";
import { ActivatedRoute, Router } from "@angular/router";
import { LayoutService } from "src/app/layout/service/app.layout.service";
import { createUserRepository } from "../../domain/createUser.repository";
import { ToastService } from "src/app/service/toast.service";
import { config } from "src/config";
import { AuthService } from "src/app/service/auth.service";
@Component({
  templateUrl: "./user-create.component.html",
  styleUrls:["./user-create.component.scss"],
  providers: [ ConfirmationService, createUserRepository],
})
export class userCreateComponent implements OnInit {
  userForm!: FormGroup;
  isLoading = false;
  userId: number = 0;
  buttonText: string = "Create User";
  isSubmitted: boolean = false;
  userTypes!: { label: string; value: number }[];
  activeTabIndex: number = 0; // Property to manage the active tab
  layout:number=0;
  configEnable=config.configEnable
  constructor(
      private fb: FormBuilder,
      public userService: UserService,
      private toastService: ToastService,
      private createUserRepo: createUserRepository,
      public route: ActivatedRoute,
      private layoutService: LayoutService,
      public router: Router,
      private authService: AuthService,
  ) {
    // this.userTypes = this.authService.userType==="Customer" && !config.configJson.webConfig.permissions.createDealer
    this.userTypes = this.authService.userType==="Customer"
        ? [{ label: "Customer", value: 2 }]
        : [
          { label: "Customer", value: 2 },
          { label: "Dealer", value: 1 },
        ];
  }
  getUserTypeLabel(type: number): string {
    const user = this.userTypes.find((v) => v.value == type);
    return user ? user.label : "Unknown";
  }
  ngOnInit() {
    this.layout=config.layout;
    console.log(this.layout)
    this.route.queryParams.subscribe((v) => {
      this.userId = Number(v["userId"]) || 0;

      if (this.userId != 0) {
        this.getDeviceDetailsAndPatch(this.userId);
        this.buttonText = "Update User";
      }
    });

    this.createForm();
  }

  getDeviceDetailsAndPatch(id: any) {
    if (id != 0) {
      this.createUserRepo
          .getAndPatchUserData(id)
          .pipe(
              finalize(() => {
                this.isLoading = false;
              })
          )
          .subscribe({
            next: (d) => {
              this.userForm.patchValue(d);
            },

            error: (e) => {
              this.toastService.toastMessage("error","Message", e.error.data);
            },
          });
    }
  }
  createForm(): void {
    this.userForm = this.fb.group({
      id: [0],
      loginId: ["", [Validators.required]],
      fkParentId: [0],
      fkCustomerId: [0],
      userName: ["", [Validators.required]],
      email: [""],
      password: ["", [Validators.required]],
      mobileNo: ["", [Validators.required]],
      userType: [2, [Validators.required]],
      timezone: ["05:30"],
      creationTime: [moment().format("X")],
      lastUpdateOn: [moment().format("X")],
      isActive: [1],
    });
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.userForm.valid) {
      const user = this.userForm.value;
      if (this.userId != 0) {
        this.updateUser(user);
      } else {
        this.createUser(user);
      }
    } else {
      this.toastService.toastMessage("error","Message", "Check All Fields");
    }
  }
  onTabChange(event: any) {
    // Example logic to set different data based on which tab is selected
    if (event.index === 1 && this.userId) {
      this.userService.changeLoginId(this.userId); // Store the loginId
    }
  }
  createUser(user: any): void {
    this.createUserRepo
        .createUserData(user)
        .pipe(
            finalize(() => {
              this.isLoading = false;
            })
        )
        .subscribe({
          next: (d) => {
            this.router.navigate(["/user", "Device created successfully"]);

          },
          error: (e) => {
            this.toastService.toastMessage("error","Message", e.error.data);
          },
        });
  }

  updateUser(user: any): void {
    this.createUserRepo
        .updateUserData(user.id, user)
        .pipe(
            finalize(() => {
              this.isLoading = false;
            })
        )
        .subscribe({
          next: (d) => {
            this.router.navigate(["/user", "Device updated successfully"]);
          },
          error: (e: any) => {
            this.toastService.toastMessage("error","Message", e.error.data);
          },
        });
  }
  cancel() {
    this.router.navigate(["/user","null"]);
  }
}
