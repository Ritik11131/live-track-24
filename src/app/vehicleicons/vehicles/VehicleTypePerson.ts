import { IVehicleType } from "../IVehicleType";


export class VehicleTypePerson implements IVehicleType {

    getVehicleIcon(vehicleStatus: number, vehicleSubStatus: number): string {
        if (vehicleStatus === 0)
            return 'rp_marker_person_blue';

        if (vehicleSubStatus === 1)
            return 'rp_marker_person_green';
        else if (vehicleSubStatus === 2)
            return 'rp_marker_person_red';
        else if (vehicleSubStatus === 3)
            return 'rp_marker_person_yellow';
        else
            return 'rp_marker_person_blue';
    }
    getTitle(): string {
        return 'Person';
    }
}










