


import { IVehicleType } from "../IVehicleType";


export class VehicleTypeShip implements IVehicleType {

    getVehicleIcon(vehicleStatus: number, vehicleSubStatus: number): string {
        if (vehicleStatus === 0)
            return 'rp_marker_ship_blue';

        if (vehicleSubStatus === 1)
            return 'rp_marker_ship_green';
        else if (vehicleSubStatus === 2)
            return 'rp_marker_ship_red';
        else if (vehicleSubStatus === 3)
            return 'rp_marker_ship_yellow';
        else
            return 'rp_marker_ship_blue';
    }
    getTitle(): string {
        return 'Ship';
    }
}
