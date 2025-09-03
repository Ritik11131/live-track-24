import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from "primeng/inputtext";
import { RippleModule } from "primeng/ripple";
import { ButtonModule } from "primeng/button";
import { SendCommandRepository } from '../../domain/sendCommand.repsoitory';
import { SendCommandService } from '../../domain/sendCommand.service';
import { Device } from 'src/app/models/device';
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
  devices!: Device[];
value:string='';
commandType:string='custom';

constructor(private sendCommandRepo:SendCommandRepository,private sendCommandService:SendCommandService ){

}
onConfirm() {
  const deviceIds = this.devices.map((x) => x.id);
  this.sendCommands(deviceIds,this.commandType,this.value).then((r) => {

});
}
async sendCommands(ids: number[],commandType:string,command:string) {
  try {
      const linkDevicePromises = ids.map((id) =>
          this.sendCommandRepo.sendCommandData(id,commandType,command).toPromise()
      );
      await Promise.all(linkDevicePromises);
      this.sendCommandService.close("yes");

   
  } catch (error) {
      console.error("Error:", error);
  }
}
onCancel() {
  this.sendCommandService.close("no");
}
}
