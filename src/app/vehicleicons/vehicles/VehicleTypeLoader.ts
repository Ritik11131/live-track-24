import { IVehicleType } from "../IVehicleType";


export class VehicleTypeLoader implements IVehicleType {

    getVehicleIcon(vehicleStatus: number, vehicleSubStatus: number): string {
        if (vehicleStatus === 0)
            return 'rp_marker_loader_blue';

        if (vehicleSubStatus === 1)
            return 'rp_marker_loader_green';
        else if (vehicleSubStatus === 2)
            return 'rp_marker_loader_red';
        else if (vehicleSubStatus === 3)
            return 'rp_marker_loader_yellow';
        else
            return 'rp_marker_loader_blue';
    }
    getTitle(): string {
        return 'Loader';
    }
}









