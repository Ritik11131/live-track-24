import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonDialogService } from '../../domain/buttonDailog.service';

@Component({
  selector: 'app-buttondialog',
  standalone: true,
  imports: [ButtonModule,InputTextModule,FormsModule,CommonModule],
  templateUrl: './buttondialog.component.html',
  styleUrl: './buttondialog.component.scss'
})
export class ButtondialogComponent {
  title: string = '';

  buttonOneValue :string = '';
  buttonTwoValue :string = '';
  illustration:string='';

  constructor(private ButtonDialogService:ButtonDialogService ) {}


  onConfirm() {
    this.ButtonDialogService.close('yes');
  }
  offConfirm(){
    this.ButtonDialogService.close('no');
  }
  onCancel() {
    this.ButtonDialogService.close('cancel');
  }
  
}
