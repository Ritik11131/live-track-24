

import { IVehicleType } from "../IVehicleType";


export class VehicleTypeBus implements IVehicleType {

    getVehicleIcon(vehicleStatus: number, vehicleSubStatus: number): string {
        if (vehicleStatus === 0)
            return 'rp_marker_bus_blue';

        if (vehicleSubStatus === 1)
            return 'rp_marker_bus_green';
        else if (vehicleSubStatus === 2)
            return 'rp_marker_bus_red';
        else if (vehicleSubStatus === 3)
            return 'rp_marker_bus_yellow';
        else
            return 'rp_marker_bus_blue';
    }
    getTitle(): string {
        return 'Bus';
    }
}

