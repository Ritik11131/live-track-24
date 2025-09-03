import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {VehicleListComponent} from "./vehicle-list.component";
import {VehicleDetailsComponent} from "../../../vehicleDetails/presenter/vehicle-details/vehicle-details.component";
import {VehicleTripsComponent} from "../../../vehicleTrip/presenter/vehicle-trips/vehicle-trips.component";
import { VehicleStopLocationsComponent } from '../../../vehicleStops/presenter/vehicle-stop-locations/vehicle-stop-locations.component';
import { SocGraphComponent } from 'src/app/tracking/socGraph/presenter/soc-graph/soc-graph.component';
import { TemperatureAnalysisComponent } from 'src/app/tracking/temperatureAnalysis/presenter/temperature-analysis/temperature-analysis.component';
@NgModule({
    imports: [RouterModule.forChild([
        {
            path: '', component: VehicleListComponent, children: [
                {path: '', redirectTo: 'details', pathMatch: "full"},
                {path: 'details', component: VehicleDetailsComponent},
                {path: 'trips', component: VehicleTripsComponent},
                {path: 'stops', component: VehicleStopLocationsComponent},
                {path: 'socanalysis', component: SocGraphComponent},
                {path: 'tempanalysis', component: TemperatureAnalysisComponent}

            ]
        },
    ])],
    exports: [RouterModule]
})
export class VehicleListRoutingModule {
}

