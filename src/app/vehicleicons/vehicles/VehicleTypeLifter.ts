


import { IVehicleType } from "../IVehicleType";


export class VehicleTypeLifter implements IVehicleType {

    getVehicleIcon(vehicleStatus: number, vehicleSubStatus: number): string {
        if (vehicleStatus === 0)
            return 'rp_marker_lifter_blue';

        if (vehicleSubStatus === 1)
            return 'rp_marker_lifter_green';
        else if (vehicleSubStatus === 2)
            return 'rp_marker_lifter_red';
        else if (vehicleSubStatus === 3)
            return 'rp_marker_lifter_yellow';
        else
            return 'rp_marker_lifter_blue';
    }
    getTitle(): string {
        return 'Lifter';
    }
}




