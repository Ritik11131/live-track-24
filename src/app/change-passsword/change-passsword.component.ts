import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {ConfirmationService, MessageService} from "primeng/api";
import {UserService} from "../dashboard/user/services/user.service";
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {ToastModule} from "primeng/toast";
import {CommonModule} from "@angular/common";

@Component({
    selector: 'app-change-passsword',
    templateUrl: './change-passsword.component.html',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        ToastModule,
        CommonModule
    ],
    providers: [MessageService],
    styleUrls: ['./change-passsword.component.css']
})
export class ChangePassswordComponent implements OnInit {
    changePasswordForm: FormGroup;

    constructor(private formBuilder: FormBuilder,
                private userRepo: UserService,
                public ref: DynamicDialogRef,
                private messageService: MessageService) {
        this.changePasswordForm = this.formBuilder.group({
            oldPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(4)]],
            confirmPassword: ['', Validators.required]
        }, {
            validator: this.mustMatch('newPassword', 'confirmPassword')
        });
    }


    mustMatch(password: string, confirmPassword: string) {
        return (formGroup: FormGroup) => {
            const passwordControl = formGroup.controls[password];
            const confirmPasswordControl = formGroup.controls[confirmPassword];

            if (confirmPasswordControl.errors && !confirmPasswordControl.errors['mustMatch']) {
                return;
            }

            if (passwordControl.value !== confirmPasswordControl.value) {
                confirmPasswordControl.setErrors({mustMatch: true});
            } else {
                confirmPasswordControl.setErrors(null);
            }
        };
    }

    onSubmit() {
        if (this.changePasswordForm.invalid) {
            return;
        }
        this.userRepo.changePassword(
            {
                "oldPassword": this.changePasswordForm.value.oldPassword,
                "newPassword": this.changePasswordForm.value.newPassword
            }
        ).subscribe({
            next: (d) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Device Master',
                    detail: 'Change Password Successfully' ?? "Some thing went wrong"
                });
                this.ref.close(true);
            },
            error: (e) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Change Password',
                    detail: e.error.data.message ?? "Some thing went wrong"
                });
            }
        });
        console.log('Form Submitted', this.changePasswordForm.value);
    }


    onCancel() {
        this.ref.close(true);
    }

    ngOnInit(): void {
    }

}
