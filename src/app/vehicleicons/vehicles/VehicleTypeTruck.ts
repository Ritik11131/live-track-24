

import { IVehicleType } from "../IVehicleType";


export class VehicleTypeTruck implements IVehicleType {

    getVehicleIcon(vehicleStatus: number, vehicleSubStatus: number): string {
        if (vehicleStatus === 0)
            return 'rp_marker_truck_blue';

        if (vehicleSubStatus === 1)
            return 'rp_marker_truck_green';
        else if (vehicleSubStatus === 2)
            return 'rp_marker_truck_red';
        else if (vehicleSubStatus === 3)
            return 'rp_marker_truck_yellow';
        else
            return 'rp_marker_truck_blue';
    }
    getTitle(): string {
        return 'Truck';
    }
}















