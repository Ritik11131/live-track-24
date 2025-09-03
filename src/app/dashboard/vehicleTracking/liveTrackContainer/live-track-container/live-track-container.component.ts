import { Component, Input } from "@angular/core";
import { LiveTrackComponent } from "../../liveTrack/live-track/live-track.component";
import { VehicleTripsComponent } from "../../vehicleTrip/presenter/vehicle-trips/vehicle-trips.component";
import { VehicleStopLocationsComponent } from "../../vehicleStops/presenter/vehicle-stop-locations/vehicle-stop-locations.component";
import { SocGraphComponent } from "../../socGraph/presenter/soc-graph/soc-graph.component";
import { TemperatureAnalysisComponent } from "../../temperatureAnalysis/presenter/temperature-analysis/temperature-analysis.component";
import { TabViewModule } from "primeng/tabview";
import { CommonModule } from "@angular/common";
import { DatePipe } from "@angular/common";
@Component({
  selector: "app-live-track-container",
  standalone: true,
  imports: [
    CommonModule,
    LiveTrackComponent,
    TabViewModule,
    TemperatureAnalysisComponent,
    VehicleTripsComponent,
    VehicleStopLocationsComponent,
    SocGraphComponent,
  ],
  templateUrl: "./live-track-container.component.html",
  styleUrls: ["./live-track-container.component.scss"],
  providers:[DatePipe]
})
export class LiveTrackContainerComponent {
  @Input() map!: L.Map;
  @Input() vehicleid!: number;
}
