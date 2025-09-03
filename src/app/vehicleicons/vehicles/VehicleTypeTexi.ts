

import { IVehicleType } from "../IVehicleType";


export class VehicleTypeTexi implements IVehicleType {

    getVehicleIcon(vehicleStatus: number, vehicleSubStatus: number): string {
        if (vehicleStatus === 0)
            return 'rp_marker_texi_blue';

        if (vehicleSubStatus === 1)
            return 'rp_marker_texi_green';
        else if (vehicleSubStatus === 2)
            return 'rp_marker_texi_red';
        else if (vehicleSubStatus === 3)
            return 'rp_marker_texi_yellow';
        else
            return 'rp_marker_texi_blue';
    }
    getTitle(): string {
        return 'Taxi';
    }
}
















