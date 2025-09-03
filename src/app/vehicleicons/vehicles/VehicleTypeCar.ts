import { IVehicleType } from "../IVehicleType";


export class VehicleTypeCar implements IVehicleType {

    getVehicleIcon(vehicleStatus: number, vehicleSubStatus: number): string {
        if (vehicleStatus === 0)
            return 'rp_marker_car_blue';

        if (vehicleSubStatus === 1)
            return 'rp_marker_car_green';
        else if (vehicleSubStatus === 2)
            return 'rp_marker_car_red';
        else if (vehicleSubStatus === 3)
            return 'rp_marker_car_yellow';
        else
            return 'rp_marker_car_blue';
    }
    getTitle(): string {
        return 'Car';
    }
}
