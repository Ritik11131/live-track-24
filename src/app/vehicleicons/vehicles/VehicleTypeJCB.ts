

import { IVehicleType } from "../IVehicleType";


export class VehicleTypeJCB implements IVehicleType {

    getVehicleIcon(vehicleStatus: number, vehicleSubStatus: number): string {
        if (vehicleStatus === 0)
            return 'rp_marker_jcb_blue';

        if (vehicleSubStatus === 1)
            return 'rp_marker_jcb_green';
        else if (vehicleSubStatus === 2)
            return 'rp_marker_jcb_red';
        else if (vehicleSubStatus === 3)
            return 'rp_marker_jcb_yellow';
        else
            return 'rp_marker_jcb_blue';
    }
    getTitle(): string {
        return 'JCB';
    }
}





