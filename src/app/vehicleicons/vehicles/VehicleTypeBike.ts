
import { IVehicleType } from "../IVehicleType";


export class VehicleTypeBike implements IVehicleType {

    getVehicleIcon(vehicleStatus: number, vehicleSubStatus: number): string {
        if (vehicleStatus === 0)
            return 'rp_marker_bike_blue';

        if (vehicleSubStatus === 1)
            return 'rp_marker_bike_green';
        else if (vehicleSubStatus === 2)
            return 'rp_marker_bike_red';
        else if (vehicleSubStatus === 3)
            return 'rp_marker_bike_yellow';
        else
            return 'rp_marker_bike_blue';
    }
    getTitle(): string {
        return 'Bike';
    }
}














