import { Component} from "@angular/core";
import { CommonModule } from "@angular/common";
import { RippleModule } from "primeng/ripple";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { ProgressBarModule } from "primeng/progressbar";
import { ToastModule } from "primeng/toast";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { TooltipModule } from "primeng/tooltip";
import { SkeletonModule } from "primeng/skeleton";
import { OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Table } from "primeng/table";
import { UserService } from "../../user/services/user.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { User } from "../../user/models/user.model";
import { DialogService } from "primeng/dynamicdialog";
import { ActivatedRoute } from "@angular/router";
import { DeviceService } from "src/app/service/device.service";
import { InventoryService } from "src/app/service/inventory.service";
@Component({
  selector: "app-user-list",
  standalone: true,
  imports: [
    CommonModule,
    RippleModule,
    ButtonModule,
    SkeletonModule,
    InputTextModule,
    TooltipModule,
    TableModule,
    ProgressBarModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  templateUrl: "./user-list.component.html",
  styleUrls: ["./user-list.component.scss"],
  providers: [ DialogService, ConfirmationService],
})
export class UserListComponent implements OnInit {

  users: User[] = [];
  selectedUsers: User[] = [];
  deviceData: boolean = false;
  userData: boolean = false;
number:number=1;
  constructor(
    protected userService: UserService,
    private messageService: MessageService,
    private router: Router,
    public route: ActivatedRoute,
    public deviceService: DeviceService,
    private conformationService: ConfirmationService,
    private dialogService: DialogService,
    private inventoryService: InventoryService

  ) {}

  ngOnInit() {
    this.getUsers();
  }
  test(){
    if(this.number<4){
        this.number+=1
    }
    this.inventoryService.changeMessage(this.number);
    
      }
  getUsers(): void {
    this.userData = true;
    this.userService.getUsers().subscribe(
      (d) => {
        this.users = d;
      },
      (e) => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: e.error?.data.message ?? "Some thing went wrong",
        });
      },
      () => {
        this.userData = false;
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

  onDropDownGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, "contains");
  }
  navigateToUpdateDevice(deviceId: any) {
    this.router.navigate(["/device/update"], {
      queryParams: { deviceId: deviceId },
    });
  }
  linkedUsers(userId:number){
    this.router.navigate(["/inventory/device-list"],{queryParams: { userId: userId } })
  }

}
