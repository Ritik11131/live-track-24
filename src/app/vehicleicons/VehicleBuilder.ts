import {IVehicleType} from "./IVehicleType";
import {VehicleTypeFactory} from "./VehicleFactory";

export const VehicleStat = {
    running: "running",
    idle: "dormant",
    stop: "stop",
    online: "Online",
    neverConnected: "Never Connected",
    customerPointExpired: "Customer recharge expired",
    pointExpired: "Point Expired",
    offline: "Offline"
} as const;

export class VehicleBuilder {
  getMarkerIconPath(
    vehicleType: number | undefined,
    status: string | null,
    subStatus: string | null
  ):string {
    let vType = VehicleTypeFactory.getInstance(vehicleType);
    let image = this.getStatusSubStatus(vType,status, subStatus);
    let icon = "assets/demo/images/vehicles/" + image + ".png";
    return icon;
  }

   getStatusSubStatus(vehicleType: IVehicleType,vehicleStatus: String | null, vehicleSubStatus: String | null):String{
    // debugger;
    let status: number, subStatus: number = 0;
    if (vehicleStatus!.includes(VehicleStat.offline)) {
      status = 0;
    } else {
      status = 2; // Never Connected, Point Expired, Customer recharge expired
    }
    if (vehicleSubStatus === null) {
      subStatus = 4;
    } else if (vehicleSubStatus.includes(VehicleStat.running)) {
      subStatus = 1;
    } else if (vehicleSubStatus.includes(VehicleStat.stop)) {
      subStatus = 2;
    } else if (vehicleSubStatus.includes(VehicleStat.idle)) {
      subStatus = 3;
    } else {
      subStatus = 4;
    }
    return vehicleType.getVehicleIcon(status,subStatus);
  }

}
