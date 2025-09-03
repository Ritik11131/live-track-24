import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { InputTextModule } from "primeng/inputtext";
import { RippleModule } from "primeng/ripple";
import { ButtonModule } from "primeng/button";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
} from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms"; // Import ReactiveFormsModule
import { ActivatedRoute } from "@angular/router";
import { DeviceService } from "../../../../../../../../service/device.service";
import { MessageService } from "primeng/api";
import { finalize } from "rxjs";
import { MultiSelectModule } from "primeng/multiselect";
import { User } from "src/app/dashboard/user/models/user.model";
import { linkDeviceRepository } from "../../domain/linkDevice.repository";
import { CommonUtils } from "src/app/utils/commonUtils";
import { ToastService } from "src/app/service/toast.service";
@Component({
  selector: "app-link-user",
  standalone: true,
  imports: [
    InputTextModule,
    MultiSelectModule,
    FormsModule,
    RippleModule,
    ButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./link-user.component.html",
  styleUrls: ["./link-user.component.scss"],
  providers: [ linkDeviceRepository],
})
export class LinkUserComponent implements OnInit {
  @Output() closeForm = new EventEmitter<boolean>();

  userLinkForm!: FormGroup;
  uniqueId: number = 0;
  deviceId: number = 0;
  isLoading = false;
  users: User[] = [];

  selectedUsers: User[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public deviceService: DeviceService,
    private messageService: MessageService,
    private linkDeviceRepo: linkDeviceRepository,
    private toastService: ToastService
  ) {
    this.userLinkForm = this.fb.group({
      uniqueId: new FormControl("", [
        Validators.required,
        Validators.minLength(4),
      ]),
      deviceId: new FormControl("", [
        Validators.required,
        Validators.minLength(4),
      ]),
      users: [[]],
      selectedUsers: new FormControl([]),
    });
  }
  ngOnInit() {
    this.deviceService.currentValues.subscribe((values) => {
      (this.uniqueId = values.uniqueId),
        (this.deviceId = values.deviceId),
        this.userLinkForm.patchValue({
          uniqueId: values.uniqueId,
        });
    });
    this.getUserList();
  }

  getUserList(): void {
    // Fetch all users
    this.linkDeviceRepo.getUserData().subscribe((allUsers) => {
      allUsers.forEach((user)=>{
        user.loginId=user.loginId+"("+user.userName+")";
      })
      this.users = allUsers;
    });
  }

  linkUserTODevice() {
    const selectedUsers = this.userLinkForm.get("selectedUsers")?.value;
    if (selectedUsers.length !== 0) {
      const loginIds = selectedUsers.map((user: any) => user.id);
      this.linkDeviceRepo.linkUserData(loginIds, this.deviceId).subscribe({
        next: () => {
          this.closeUserLinkForm();
          this.deviceService.emitAddUserButtonClick();
        },
        error: (e) => {
          this.toastService.toastMessage("error","Message", e.error.data);
        },
      });
    } else {
      alert("Please add the users you want to link");
      this.closeUserLinkForm();
    }
  }
  closeUserLinkForm() {
    this.closeForm.emit(false);
  }
}
