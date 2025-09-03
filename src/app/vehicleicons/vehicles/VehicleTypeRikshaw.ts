
import { IVehicleType } from "../IVehicleType";


export class VehicleTypeRikshaw implements IVehicleType {

    getVehicleIcon(vehicleStatus: number, vehicleSubStatus: number): string {
        if (vehicleStatus === 0)
            return 'rp_marker_rikshaw_blue';

        if (vehicleSubStatus === 1)
            return 'rp_marker_rikshaw_green';
        else if (vehicleSubStatus === 2)
            return 'rp_marker_rikshaw_red';
        else if (vehicleSubStatus === 3)
            return 'rp_marker_rikshaw_yellow';
        else
            return 'rp_marker_rikshaw_blue';
    }
    getTitle(): string {
        return 'Rikshaw';
    }
}














