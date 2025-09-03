
import { IVehicleType } from "../IVehicleType";


export class VehicleTypePet implements IVehicleType {

    getVehicleIcon(vehicleStatus: number, vehicleSubStatus: number): string {
        if (vehicleStatus === 0)
            return 'rp_marker_pet_blue';

        if (vehicleSubStatus === 1)
            return 'rp_marker_pet_green';
        else if (vehicleSubStatus === 2)
            return 'rp_marker_pet_red';
        else if (vehicleSubStatus === 3)
            return 'rp_marker_pet_yellow';
        else
            return 'rp_marker_pet_blue';
    }
    getTitle(): string {
        return 'Pet';
    }
}
