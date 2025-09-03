import { IVehicleType } from "../IVehicleType";


export class VehicleTypeTanker implements IVehicleType {

    getVehicleIcon(vehicleStatus: number, vehicleSubStatus: number): string {
        if (vehicleStatus === 0)
            return 'rp_marker_tanker_blue';

        if (vehicleSubStatus === 1)
            return 'rp_marker_tanker_green';
        else if (vehicleSubStatus === 2)
            return 'rp_marker_tanker_red';
        else if (vehicleSubStatus === 3)
            return 'rp_marker_tanker_yellow';
        else
            return 'rp_marker_tanker_blue';
    }
    getTitle(): string {
        return 'Tanker';
    }
}
