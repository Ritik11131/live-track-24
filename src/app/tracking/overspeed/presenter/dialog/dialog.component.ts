import { Component, Input, OnInit } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { VehicleListService } from "../../../../service/vehicle-list.service";
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { CommonUtils } from 'src/app/utils/commonUtils';
import { dialogRepository } from '../../domain/dialog.repository';
import { ToastService } from 'src/app/service/toast.service';
@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [InputTextModule,ButtonModule,FormsModule],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  providers: [dialogRepository],

})
export class DialogComponent implements OnInit {
  deviceId!: number ;
  speedLimit: string = '';

  constructor(
    public vehicleListRepo: VehicleListService,
    private dialogRepo:dialogRepository,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
this.deviceId=this.vehicleListRepo.testDevideID;
   

  }
  closeDialogBox(){
    this.vehicleListRepo.closeDialogBox(false);

  }
  submitDialog() {
    const payload = {
      speedLimit: (this.speedLimit).toString(),
      deviceId: this.deviceId
    };
    this.dialogRepo.setOverSpeedValue(payload).subscribe(
      response => {
        // Close the dialog after successful submission
        this.closeDialogBox();
      },
      e => {
        this.toastService.toastMessage("error","Message", e.error.data);

      }
    );
  }
}