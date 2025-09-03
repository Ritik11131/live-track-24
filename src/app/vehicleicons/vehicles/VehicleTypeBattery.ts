
import { IVehicleType } from "../IVehicleType";


export class VehicleTypeBattery implements IVehicleType {

    getVehicleIcon(vehicleStatus: number, vehicleSubStatus: number): string {
        if (vehicleStatus === 0)
            return 'rp_marker_battery_blue';

        if (vehicleSubStatus === 1)
            return 'rp_marker_battery_green';
        else if (vehicleSubStatus === 2)
            return 'rp_marker_battery_red';
        else if (vehicleSubStatus === 3)
            return 'rp_marker_battery_yellow';
        else
            return 'rp_marker_battery_blue';
    }
    getTitle(): string {
        return 'Battery';
    }
}














