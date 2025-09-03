export interface IVehicleType {
    getTitle():string;
    getVehicleIcon(vehicleStatus: number, vehicleSubStatus: number): string;
}
