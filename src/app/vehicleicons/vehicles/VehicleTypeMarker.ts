



import { IVehicleType } from "../IVehicleType";


export class VehicleTypeMarker implements IVehicleType {

    getVehicleIcon(vehicleStatus: number, vehicleSubStatus: number): string {
        if (vehicleStatus === 0)
            return 'rp_marker_marker_blue';

        if (vehicleSubStatus === 1)
            return 'rp_marker_marker_green';
        else if (vehicleSubStatus === 2)
            return 'rp_marker_marker_red';
        else if (vehicleSubStatus === 3)
            return 'rp_marker_marker_yellow';
        else
            return 'rp_marker_marker_blue';
    }
    getTitle(): string {
        return 'Marker';
    }
}





