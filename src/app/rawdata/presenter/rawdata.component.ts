import { Component, OnDestroy, ViewContainerRef } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { RippleModule } from "primeng/ripple";
import { MessageService, SharedModule } from "primeng/api";
import { Table, TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { LastListService } from "../domain/last-list.service";
import { DeviceStatusPipe } from "../device-status.pipe";
import { CommonModule, DatePipe, IMAGE_CONFIG } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { CommandRepoService } from "../../service/command-repo.service";
import { DatePickerComponent } from "../../dashboard/commonComponents/dateComponent/presenter/date-picker/date-picker.component";
import { SendCommandService } from "../sendCommand/domain/sendCommand.service";
import { ToastService } from "src/app/service/toast.service";
import { RawData } from "../domain/rawData.model";
import { RawDataRepository } from "../domain/rawData.repository";

@Component({
  selector: "app-rawdata",
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    RippleModule,
    SharedModule,
    TableModule,
    ToastModule,
    DatePipe,
    DeviceStatusPipe,
    CommonModule,
    FormsModule,
    DatePickerComponent,
  ],
  templateUrl: "./rawdata.component.html",
  styleUrl: "./rawdata.component.scss",
  providers: [DeviceStatusPipe, DatePipe, MessageService, RawDataRepository],
})
export class RawdataComponent implements OnDestroy {
  deviceId: string = "";
  private searchInterval: any; // Variable to store the interval ID
  rawData: RawData[] = [];

  constructor(

    private viewContainerRef: ViewContainerRef,
    private toastService: ToastService,
    private rawDataRepo: RawDataRepository,
    private sendCommandService: SendCommandService
  ) {}

  search() {
    this.fetchRawData();

    // Clear any existing interval
    if (this.searchInterval) {
      clearInterval(this.searchInterval);
    }

    // Set a new interval to fetch data every 10 seconds
    this.searchInterval = setInterval(() => {
      this.fetchRawData();
    }, 10000);
  }

  fetchRawData() {
    this.rawDataRepo.getRawData(this.deviceId).subscribe(
      (data) => {
        console.log(data)
        if (data && data.recTime) {
          // Check if the new data's recTime is different from the last data in rawData
          if (!this.rawData.length || this.rawData[this.rawData.length - 1].recTime !== data.recTime) {
            this.rawData.push(data);
          }
        } else {
          console.error('Received data is not in the expected format', data);
        }
      },
      (error) => {
        this.toastService.showErrorToast(error.error.message);
      }
    );
  }

  sendCommand() {
    this.sendCommandService
      .open(this.viewContainerRef, this.deviceId)
      .subscribe((result) => {
        if (result === "yes") {
          this.toastService.showSuccessToast("Command Sent successfully");
        } else {
          console.log("Dialog was cancelled");
        }
      });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, "contains");
  }


      // search(): void {
    //     const d = this.datePipe.transform(Date(), 'yyyy-MM-dd');
    //     const fromT = d + ' 00:00:00';
    //     const toT = d + ' 23:59:59';

    //     if (this.deviceId) {
    //         if (this.subscriber) {
    //             clearInterval(this.subscriber);
    //         }
    //         this.getLastPoint(this.deviceId, fromT, toT);
    //         this.subscriber = setInterval(() => {
    //             if (this.deviceId) {
    //                 this.getLastPoint(this.deviceId, fromT, toT);
    //             }
    //         }, 30000);
    //     }
    // }

     // sendCommand(): void {
        
    //     if (this.point) {
    //         this.ref = this.dialogService.open(SendCommandComponent, {
    //             header: 'Send Command',
    //             data: {DeviceId: this.point.deviceId, Channel: this.point.port},
    //             width: "70vw",
    //             closable: true,
    //             closeOnEscape: true,
    //         });
    //         this.ref.onClose.subscribe((result) => {
    //             if (result) {
    //                 const c = (result as Command);
    //                 this.commandRepo.sendCommand(c).subscribe((d) => {
    //                 });
    //             }
    //         });
    //     }else{

    //     }
    // }

    // addDevice(deviceId: string): void {
    //     const ref = this.dialogService.open(DeviceMasterComponent, {
    //         header: 'Add Device',
    //         data: {
    //             uniqueId: deviceId
    //         },
    //         width: "70vw",
    //         closable: true,
    //         closeOnEscape: true,
    //     });
    // }


    // getLastPoint(deviceId: string, fromTime: string, toTime: string): void {
    //     this.points = [];
    //     this.lastPointRepo.getDeviceHistoryPoints(deviceId, fromTime, toTime)
    //         .pipe(finalize(() => {
    //             // Hide Search
    //         }))
    //         .subscribe({
    //             next: (d) => {
    //                 this.points = d.data.list;
    //                 this.serverTime = d.data.serverTime
    //                 if (this.points.length > 0) {
    //                     this.point = d.data.list[0]
    //                 }
    //             },
    //             error: (e) => {
    //                 // this.toasterService.error(e.error?.data.message?? "Something went wrong", 'Device List');
    //             }
    //         });
    // }

    ngOnDestroy(): void {
      clearInterval(this.searchInterval);

    }
}
