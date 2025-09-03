import {Component, Inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {CalendarModule} from "primeng/calendar";
import {FormsModule} from "@angular/forms";
import { DeviceRechargeRepository } from '../../domain/device-recharge.repository';
import {ToastService} from "src/app/service/toast.service";
import { DeviceRechargeService } from '../../domain/device-recharge.service';
import {InputTextModule} from "primeng/inputtext";
import {TooltipModule} from "primeng/tooltip";

import {DOCUMENT} from '@angular/common';
@Component({
  selector: 'app-device-recharge',
  standalone: true,
  imports: [CommonModule, InputTextModule, CalendarModule, TooltipModule, FormsModule],
  templateUrl: './device-recharge.component.html',
  styleUrl: './device-recharge.component.scss',
  providers: [DeviceRechargeRepository],

})
export class DeviceRechargeComponent {
  date!: Date ;
    deviceId!: number;
    customerRechargeDate!:string;
    minDate: Date = new Date();
  
    constructor(
        private deviceRechargeRepository: DeviceRechargeRepository,
        private deviceRechargeService: DeviceRechargeService,
        private toastService: ToastService,
    ) {
    }

    ngOnInit(): void {
this.customerRechargeDate=this.date.toISOString().split('T')[0];
    }

    submit() {
        const payload = {
            fkDeviceId: this.deviceId,
            CustomerRechargeDate:this.date.toISOString().split('T')[0],
            NextRechargeDate:this.date.toISOString().split('T')[0]
        };
        this.deviceRechargeRepository.setNextValidity(payload).subscribe(
            (response) => {
                this.deviceRechargeService.close('yes')
            },
            (e) => {
                this.deviceRechargeService.close(e)
            }
        );
    }

    closeDialogBox() {
        this.deviceRechargeService.close("cancel");
    }


}
