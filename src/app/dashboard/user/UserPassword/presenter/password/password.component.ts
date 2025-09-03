import { Component, Input, OnInit } from "@angular/core";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { User } from "../../../models/user.model";
import { MessageService } from "primeng/api";
import { FormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";
import { userPasswordRepository } from "../../domain/userPassword.repository";
import { CommonUtils } from "src/app/utils/commonUtils";
import { ToastService } from "src/app/service/toast.service";
@Component({
  selector: "app-password",
  templateUrl: "./password.component.html",
  standalone: true,
  styleUrls: ["./password.component.css"],
  imports: [FormsModule, InputTextModule, ButtonModule],
  providers: [MessageService, userPasswordRepository],
})
export class PasswordComponent implements OnInit {
  @Input() password!: string;
  user!: User;

  constructor(
    private config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private toast: MessageService,
    private userPasswordRepo: userPasswordRepository,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const patchObj = this.config?.data?.patchObj || undefined;
    this.user = patchObj as User;
    this.password = patchObj.password;
  }

  changePassword(): void {
    if (this.user) {
      this.user.password = this.password;
      this.userPasswordRepo.updateUserData(this.user.id, this.user).subscribe(
        (d) => {
          // this.toast.success(`User password changed`, 'Password Change');
          this.ref.close(true);
        },
        (e) => {
          this.toastService.toastMessage("error","Message", e.error.data);
        }
      );
    }
  }

  close(): void {
    this.ref.close(false);
  }
}
