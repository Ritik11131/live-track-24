import * as L from "leaflet";
import { PlaybackController } from 'src/app/dashboard/commonComponents/playback';
import { HistoryReplayViewModel } from 'src/app/viewModels/historyReplay.viewModel';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { SliderModule } from 'primeng/slider';
import {DatePipe, NgIf} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from "src/app/service/toast.service";
import {  ButtonModule } from 'primeng/button';
import { TabViewModule } from "primeng/tabview";
import { CommonModule } from "@angular/common";
import { VehicleBuilder,VehicleStat } from "src/app/vehicleicons/VehicleBuilder";
import { IdleReport } from "src/app/dashboard/report/domain/idleReport.model";
import { StopReport } from "src/app/dashboard/report/domain/stopReport.model";

 @Component({
  selector: 'app-history-replay',
  standalone: true,
  imports: [
    SliderModule,
    DatePipe,
    FormsModule,
    TabViewModule,
    ButtonModule,
    CommonModule,
    NgIf,
  ],
  templateUrl: './history-replay.component.html',
  styleUrl: './history-replay.component.scss'
})
export class HistoryReplayComponent {
@Input() selectedDateRange! :string;
@Input() map! :L.Map;
@Input() vehicleid! :number;
public seekValue: number = 0;
public speed = 1;
public playPause = true;
public totalTravelDistance = 0;
public distance = 0;
public speedArray: number[] = [];
public timeStamparray: string[] = [];
public index = 0;
private playbackController!: PlaybackController;
private totalPoints: number = 0;
tripIdleLocations: IdleReport[] = [];
tripStopLocations: StopReport[] = [];

constructor(private toastService:ToastService,private historyReplayViewModel:HistoryReplayViewModel){}
ngOnInit(): void {
  this.fetchDeviceData();
}
fetchDeviceData(): void {
  const [startDate, endDate] = this.selectedDateRange.split('---');
  const payload = {
    DeviceId: this.vehicleid.toString(),
    FromTime: startDate,
    ToTime: endDate
  };
  
  this.historyReplayViewModel.getPlayback(payload).subscribe(
    (d: any) => {
      this.processDeviceData(d['data']);
    },
    error => {
      this.toastService.errorToast(error);
    }
  );
}


processDeviceData(data: any[]): void {
  console.log(data)
  if (data && data.length > 0) {
    const route = data.map(d => new L.LatLng(d.latitude, d.longitude));
    this.totalPoints = route.length;
    this.totalTravelDistance = (data[data.length - 1].details.totalDistance / 1000) - (data[0].details.totalDistance /1000); // Assuming all entries have same total distance
    this.map.flyTo(route[0]);
    this.speedArray = data.map(d => (d.speed / 1000));
    console.log(this.speedArray)
    this.timeStamparray = data.map(d => d.timestamp);
    const icon = new VehicleBuilder().getMarkerIconPath(1, VehicleStat.running, VehicleStat.running);

    this.playbackController = new PlaybackController({
      map: this.map,
      route: route,
      iconUrl: icon,
      iconSize: [25, 41],
      iconAnchor: [15, 45],
      animationDuration: 3000,
      speedMultiplier: 1,
      positionCallback: this.updateSeekValue.bind(this)
    });
  }
}
setSpeed(): void {
  this.speed = this.speed === 4 ? 1 : this.speed + 1;
  this.playbackController.setSpeed(this.speed);
}

seek(position: number): void {
  this.playbackController.seek(position / 100);
}

close(): void {
  if (this.playbackController) {
    this.playbackController.stop();
  }
  this.seekValue = 0;
  this.speed = 1;
  this.playPause = true;
  this.totalTravelDistance = 0;
  this.distance = 0;
  this.speedArray = [];
  this.timeStamparray = [];
  this.index = 0;
  this.totalPoints = 0;
  // Optionally, you can also remove the marker and polyline from the map
  if (this.playbackController) {
    this.playbackController.clear();
  }
}
start(): void {
  this.playbackController.play();
}

stop(): void {
  this.playbackController.stop();
}

end(): void {
  this.playbackController.endPlayback();
}
playPauseFunction(): void {
  if (this.playPause) {
    this.start();
  } else {
    this.stop();
  }
  this.playPause = !this.playPause;
}

private updateSeekValue(index: number): void {
  if (this.totalPoints > 1) {
    this.seekValue = (index / (this.totalPoints - 1)) * 100;
    this.index = index;
    this.distance = this.totalTravelDistance * (index / (this.totalPoints - 1));
  } else {
    this.seekValue = 0;
  }
}

  getTripIdleLocations() {
    // const [startDate, endDate] = this.selectedDateRange.split('---');
    // const payload = {
    //   DeviceId: this.vehicleid.toString(),
    //   FromTime: startDate,
    //   ToTime: endDate,
    //   reportType:"idleReport"

    // };
    // this.vehicleListRepository
    //   .getIdleData(
    //    payload
    //   )
    //   .subscribe(
    //     (data) => {
    //       this.tripIdleLocations = data;
    //     },
    //     this.toastService.errorToast,
    //     () => {}
    //   );
  }
  getTripStopLocations() {
    // const [startDate, endDate] = this.selectedDateRange.split('---');
    // const payload = {
    //   DeviceId: this.vehicleid.toString(),
    //   FromTime: startDate,
    //   ToTime: endDate,
    //   reportType:"stopReport"
    // };
    // this.vehicleListRepository
    //   .getStopData(
    // payload
    //   )
    //   .subscribe(
    //     (data) => {
    //       this.tripStopLocations = data;
    //     },
    //     this.toastService.errorToast,
    //     () => {}
    //   );
  }
showIdlePointOnMap(idle: IdleReport) {
}
showStopPointOnMap(stop: StopReport) {
}
}
