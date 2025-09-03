import { AfterViewInit, Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import * as L from "leaflet";
import { LiveTrackContainerComponent } from "../../liveTrackContainer/live-track-container/live-track-container.component";
import { MapUtils } from "src/app/dashboard/commonComponents/common";
import { HistoryReplayComponent } from "../../HistoryReplay/history-replay/history-replay.component";
import { LiveTrackComponent } from "../../liveTrack/live-track/live-track.component";
import { VehicleListComponent } from "../../vehicle-list/vehicle-list/vehicle-list.component";
@Component({
  selector: "app-tracking-home",
  standalone: true,
  imports: [
    HistoryReplayComponent,
    LiveTrackComponent,
    CommonModule,
    FormsModule,
    VehicleListComponent,
    LiveTrackContainerComponent
  ],
  templateUrl: "./tracking-home.component.html",
  styleUrl: "./tracking-home.component.scss",
})
export class TrackingHomeComponent implements OnInit {
  replayControls: boolean = true;
  showTemplate: string = "device-list";
  map!: L.Map;
  selectedDateRange: string = "";
  id: number = 0;
  ngOnInit() {
    this.initView();
  }

  initView() {
    setTimeout(() => {
      this.map = MapUtils.initMap("map");
    }, 300);
  }
  changeViewtoLiveTrack(event: any) {
    this.id = event;
    console.log(this.id);
    this.showTemplate = "live-track";
  }
  changeViewToHistoryReplay(event: any) {
    console.log(event);
    this.replayControls = false;
    this.selectedDateRange =event;

  }
}
