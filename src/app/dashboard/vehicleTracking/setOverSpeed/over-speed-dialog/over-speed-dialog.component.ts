import { Component, Input, OnInit } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { CommonUtils } from 'src/app/utils/commonUtils';
import { ToastService } from 'src/app/service/toast.service';
import { setOverSpeedRequest } from 'src/app/domain/setOverSpeed/setOverSpeedRequest';
import { OverSpeedDialogViewModel } from 'src/app/viewModels/setOverSpeed.viewModel';
@Component({
  selector: 'app-over-speed-dialog',
  standalone: true,
  imports: [InputTextModule,ButtonModule,FormsModule],
  templateUrl: './over-speed-dialog.component.html',
  styleUrl: './over-speed-dialog.component.scss'
})
export class OverSpeedDialogComponent {
  deviceId!: number ;
  speedLimit: string = '';
constructor(private overSpeedDialogViewModel:OverSpeedDialogViewModel,
  private toastService: ToastService,
 ){}
  submitDialog(){
    const payload:setOverSpeedRequest = {
      speedLimit: (this.speedLimit).toString(),
      deviceId: this.deviceId
    };
    this.overSpeedDialogViewModel.setOverSpeedLimit(payload).subscribe((data)=>{
      this.overSpeedDialogViewModel.close('yes');

    },(error:any)=>{
      this.toastService.errorToast(error)
      this.overSpeedDialogViewModel.close('no');
    })
  }
  closeDialogBox(){
    this.overSpeedDialogViewModel.close('no');

  }
}
