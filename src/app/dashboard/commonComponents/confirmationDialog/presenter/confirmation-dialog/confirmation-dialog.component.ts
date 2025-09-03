import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationDialogService } from '../../domain/confirmation-dialog.service';
@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [FormsModule,InputTextModule,ButtonModule,CommonModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss'
})
export class ConfirmationDialogComponent {
  title: string|undefined = '';
  inputValue: string = '';

  constructor(private confirmationDialogService:ConfirmationDialogService ) {}

  onConfirm() {
    this.confirmationDialogService.close('yes');
  }

  onCancel() {
    this.confirmationDialogService.close('no');
  }
}
