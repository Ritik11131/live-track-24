import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from "@angular/core";
import { MenuItem } from "primeng/api";
import { LayoutService } from "./service/app.layout.service";
import { Router } from "@angular/router";
import { AuthService } from "../service/auth.service";
import { DialogService } from "primeng/dynamicdialog";
import { ChangePassswordComponent } from "../change-passsword/change-passsword.component";
import { Subscription } from "rxjs";
import { config } from "src/config";
import { ToastService } from "../service/toast.service";
import { NotificationAlert } from "../service/notificationAlert.sevice";
import { notificationRepository } from "../dashboard/notifications/domain/notification.repository";
import { Notification } from "../dashboard/notifications/domain/notification.model";
import { CommonUtils } from "../utils/commonUtils";

@Component({
  selector: "app-topbar",
  templateUrl: "./app.topbar.component.html",
  styleUrls: ["./app.topbar.scss"],
  providers: [DialogService, notificationRepository],
})
export class AppTopBarComponent implements OnInit, OnDestroy {
  private subscription!: Subscription;
  menu: MenuItem[] = [];
  @ViewChild("searchinput") searchInput!: ElementRef;
  @ViewChild("menubutton") menuButton!: ElementRef;
  notificationCount: number = 0;
  searchActive: boolean = false;
  userType: string = "Admin";
  notifications: Notification[] = [];
  selectedNotificationType: string[] | null = null;
  LastTime: string | null = null;
  Limit: number = 100;
  selectedVehicle: number | null = null;

  isDropdownVisible = false;

  toggleDropdown() {
    this.isDropdownVisible = !this.isDropdownVisible;
    this.addTimeInLocalStorage();
  }

  addTimeInLocalStorage() {
    const currentTimestamp = CommonUtils.addTimeZone(new Date().toISOString());
    localStorage.setItem('currentTimestamp', currentTimestamp);
  }

  constructor(
      public layoutService: LayoutService,
      private router: Router,
      public authService: AuthService,
      private toastService: ToastService,
      private dialogService: DialogService,
      private notificationAlert: NotificationAlert,
      private notificationRepo: notificationRepository,
      private cdr: ChangeDetectorRef // ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.addTimeInLocalStorage();

    this.subscription = this.layoutService.closeNavbar.subscribe((isOpen) => {
      this.layoutService.onMenuToggle();
    });

    this.notificationAlert.notificationCount$.subscribe(
        (data) => {
          console.log("hi")
          this.getNotification();
        },
        this.toastService.errorToast
    );
  }

  changePassword() {
    this.dialogService.open(ChangePassswordComponent, {
      header: "Change Password",
      data: {},
      width: "35vw",
      closable: true,
      closeOnEscape: true,
      baseZIndex: 3000,
    });
  }

  getNotification() {
    this.notificationRepo
        .getNotification(
            this.Limit,
            this.LastTime,
            this.selectedNotificationType,
            this.selectedVehicle
        )
        .subscribe(
            (notifications) => {
              const currentTimestamp = localStorage.getItem('currentTimestamp');
              if (currentTimestamp) {
                const currentTimestampDate = new Date(currentTimestamp);
                this.notifications = notifications.filter((notification) => {
                  const eventTime = new Date(notification.eventtime);
                  return eventTime > currentTimestampDate;
                });
                this.notificationCount = this.notifications.length; // Update notification count
              }
              // console.log(this.notifications);
            },
            (e) => {
              this.toastService.toastMessage("error", "Message", e.error.data);
            }
        );
  }

  goToNotification() {
    this.router.navigate(['/notifications']);
  }

  onMenuButtonClick() {
    this.layoutService.onMenuToggle();
  }

  activateSearch() {
    this.searchActive = true;
    setTimeout(() => {
      this.searchInput.nativeElement.focus();
    }, 100);
  }

  deactivateSearch() {
    this.searchActive = false;
  }

  removeTab(event: MouseEvent, item: MenuItem, index: number) {
    this.layoutService.onTabClose(item, index);
    event.preventDefault();
  }

  get layoutTheme(): string {
    return this.layoutService.config().layoutTheme;
  }

  get colorScheme(): string {
    return this.layoutService.config().colorScheme;
  }

  get tabs(): MenuItem[] {
    return this.layoutService.tabs;
  }

  logout() {
this.authService.logout()
  }

  childlogout() {
    this.authService.childLogout();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // closeNotification() {
  // this.toggleDropdown()
  // }

  protected readonly config = config;
}
