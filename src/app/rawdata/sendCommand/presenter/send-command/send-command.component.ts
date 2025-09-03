import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from "primeng/inputtext";
import { RippleModule } from "primeng/ripple";
import { ButtonModule } from "primeng/button";
import { SendCommandRepository } from '../../domain/sendCommand.repsoitory';
import { SendCommandService } from '../../domain/sendCommand.service';
import { ToastService } from 'src/app/service/toast.service';
@Component({
  selector: 'app-send-command',
  standalone: true,
  imports: [   InputTextModule,
    FormsModule,
    RippleModule,
    ButtonModule,],
  templateUrl: './send-command.component.html',
  styleUrl: './send-command.component.scss',
  providers:[SendCommandRepository]
})
export class SendCommandComponent {
  deviceId!: string;
value:string='';

constructor(private sendCommandRepo:SendCommandRepository,
  private toastService:ToastService,
  private sendCommandService:SendCommandService ){

}
onConfirm() {
this.sendCommandRepo.sendCommandData(this.deviceId,this.value).subscribe((data)=>{
this.sendCommandService.close("yes")
},error=>{
  this.toastService.showErrorToast("Error occured while sending the command");
  this.sendCommandService.close('no')
})

}
onCancel() {
  this.sendCommandService.close("no");
}
}
