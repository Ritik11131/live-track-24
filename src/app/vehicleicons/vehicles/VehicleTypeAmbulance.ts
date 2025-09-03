
import { IVehicleType } from "../IVehicleType";


export class VehicleTypeAmbulance implements IVehicleType {

    getVehicleIcon(vehicleStatus: number, vehicleSubStatus: number): string {
        if (vehicleStatus === 0)
            return 'rp_marker_ambulance_blue';

        if (vehicleSubStatus === 1)
            return 'rp_marker_ambulance_green';
        else if (vehicleSubStatus === 2)
            return 'rp_marker_ambulance_red';
        else if (vehicleSubStatus === 3)
            return 'rp_marker_ambulance_yellow';
        else
            return 'rp_marker_ambulance_blue';
    }
    getTitle(): string {
        return 'Ambulance';
    }
}














