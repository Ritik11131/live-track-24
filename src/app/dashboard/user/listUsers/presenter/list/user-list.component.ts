import { Component, OnDestroy, OnInit, ViewContainerRef } from "@angular/core";
import { Router } from "@angular/router";
import { Table } from "primeng/table";
import { UserService } from "../../../services/user.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { User } from "../../../models/user.model";
import { PasswordComponent } from "../../../UserPassword/presenter/password/password.component";
import { DialogService } from "primeng/dynamicdialog";
import { ActivatedRoute } from "@angular/router";
import { DeviceService } from "src/app/service/device.service";
import { Device } from "src/app/models/device";
import { LayoutService } from "src/app/layout/service/app.layout.service";
import { CommonUtils } from "src/app/utils/commonUtils";
import { listUserRepository } from "../../domain/listUser.repository";
import { ConfirmationDialogService } from "src/app/dashboard/commonComponents/confirmationDialog/domain/confirmation-dialog.service";
import { Subscription } from "rxjs";
import { ToastService } from "src/app/service/toast.service";
import { AuthService } from "src/app/service/auth.service";
@Component({
  templateUrl: "./user-list.component.html",
  providers: [DialogService, ConfirmationService, listUserRepository],
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  selectedUsers: User[] = [];
  deviceData: boolean = false;
  userData: boolean = false;
  buttonText: string = "Add New User";
  devices: { [deviceId: string]: Device[] } = {};
  // devices:Device[]=[]
  subscriptionMessage!: Subscription;
  constructor(
      protected userService: UserService,
      private messageService: MessageService,
      private router: Router,
      public route: ActivatedRoute,
      private conformationService: ConfirmationService,
      public deviceService: DeviceService,
      private dialogService: DialogService,
      public layoutService: LayoutService,
      private listUserRepo: listUserRepository,
      private confirmationDialogService: ConfirmationDialogService,
      private viewContainerRef: ViewContainerRef,
      private toastService: ToastService,
      private authService:AuthService
  ) {}

  ngOnInit() {
    this.getUsers();
    if (this.authService.userType=="Customer") {
      this.buttonText = "Add Sub User";
    }
  }
  ngAfterViewInit(): void {
    const urlParts = this.router.url.split('/');
    const fragment = urlParts[urlParts.length - 1];
    if (fragment) {
      if (fragment === 'User%20updated%20successfully') {
        this.toastService.showSuccessToast('User updated successfully');
      } else if (fragment === 'User%20created%20successfully') {
        this.toastService.showSuccessToast('User created successfully');

      }

    }
  }

  getUsers(): void {
    this.userData = true;
    this.listUserRepo.getUserData().subscribe(
        (data) => {
          // Filter users where userType is 2
          this.users = data;
        },
        this.toastService.errorToast,
        () => {
          this.userData = false;
        }
    );
  }

  deleteUsers(): void {
    if (this.selectedUsers.length === 0) {
      return;
    }
    const deviceIds = this.selectedUsers.map((x) => x.id);
    this.deleteEntries(deviceIds).then((r) => {
      this.getUsers();
    });
  }

  deleteUser(data: User) {
    this.deleteEntries([data.id]).then((r) => {
      this.getUsers();
    });
  }

  async deleteEntries(ids: number[]) {
    try {
      const deletePromises = ids.map((id) =>
          this.listUserRepo.deleteUsersData(id).toPromise()
      );
      await Promise.all(deletePromises);

      this.toastService.toastMessage(
          "error",
          "Error",
          "User have been successfully deleted."
      );
    } catch (error) {
      console.error("Error:", error);
    }
  }
  openDialog(data: User) {
    this.confirmationDialogService
        .open(this.viewContainerRef, "DELETE")
        .subscribe((result) => {
          if (result == "yes") {
            this.deleteUser(data);
          } else {
            console.log("Dialog was cancelled");
          }
        });
  }

  login(user: User){
    this.listUserRepo.getUserById(user.id).subscribe((data)=>{
          const payload={
            loginId:data.loginId,
            password:data.password,
            loginDevice:"web"
          }
          this.authService.childLogin(payload).subscribe((data)=>{
            console.log(data)
          },this.toastService.errorToast);
        },
        this.toastService.errorToast
    )


  }
  // confirm(event: any, data: User) {
  //   console.log(event.target)
  //   this.conformationService.confirm({
  //     target: event.target,
  //     message: "Are you sure that you want to proceed?",
  //     icon: "pi pi-exclamation-triangle",
  //     accept: () => {
  //       // this.deleteUsers()
  //       this.deleteUser(data);
  //     },
  //     reject: () => {
  //       //reject action
  //     },
  //   });
  // }

  showPassword(value: User): void {
    this.listUserRepo.showUserPasswordData(value.id).subscribe(
        (user) => {
          const ref = this.dialogService.open(PasswordComponent, {
            header: "Show/Change Password",
            data: {
              patchObj: user,
            },
            width: "25vw",

            baseZIndex: 3000,
            closable: true,
            closeOnEscape: true,
          });

          ref.onClose.subscribe((d) => {
            if (d) {
              this.getUsers();
              setTimeout(() => {
                this.messageService.add({
                  severity: "success",
                  summary: "Success",
                  detail: "fer",
                });
                this.toastService.toastMessage(
                    "error",
                    "Error",
                    "Password changed successfully"
                );
              }, 100);
            }
          });
        },
        (e) => {
          this.toastService.toastMessage("error","Message", e.error.data);
        }
    );
  }
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, "contains");
  }

  navigateToCreateUser() {
    this.router.navigate(["/user/create"]);
  }

  navigateToUpdateUser(user: User) {
    this.router.navigate(["/user/update"], {
      queryParams: { userId: user.id },
    });
  }
  toggleRow(deviceId: number): void {
    this.showLinkedDevices(deviceId);
  }
  showLinkedDevices(deviceId: number) {
    this.deviceData = true;
    this.listUserRepo.getDeviceData(deviceId).subscribe(
        (res) => {
          this.devices[deviceId] = res;
        },
        (e) => {
          this.toastService.toastMessage("error","Message", e.error.data);
        },
        () => {
          this.deviceData = false;
        }
    );
  }
  onDropDownGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, "contains");
  }
  navigateToUpdateDevice(deviceId: any) {
    this.router.navigate(["/device/update"], {
      queryParams: { deviceId: deviceId },
    });
  }
}
