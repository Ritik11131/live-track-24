import { IVehicleType } from "./IVehicleType";
import { VehicleTypeAmbulance } from "./vehicles/VehicleTypeAmbulance";
import { VehicleTypeBattery } from "./vehicles/VehicleTypeBattery";
import { VehicleTypeBike } from "./vehicles/VehicleTypeBike";
import { VehicleTypeBus } from "./vehicles/VehicleTypeBus";
import { VehicleTypeCar } from "./vehicles/VehicleTypeCar";
import { VehicleTypeJCB } from "./vehicles/VehicleTypeJCB";
import { VehicleTypeLifter } from "./vehicles/VehicleTypeLifter";
import { VehicleTypeLoader } from "./vehicles/VehicleTypeLoader";
import { VehicleTypeMarker } from "./vehicles/VehicleTypeMarker";
import { VehicleTypePerson } from "./vehicles/VehicleTypePerson";
import { VehicleTypePet } from "./vehicles/VehicleTypePet";
import { VehicleTypeRikshaw } from "./vehicles/VehicleTypeRikshaw";
import { VehicleTypeShip } from "./vehicles/VehicleTypeShip";
import { VehicleTypeTanker } from "./vehicles/VehicleTypeTanker";
import { VehicleTypeTexi } from "./vehicles/VehicleTypeTexi";
import { VehicleTypeTractor } from "./vehicles/VehicleTypeTractor";
import { VehicleTypeTruck } from "./vehicles/VehicleTypeTruck";



export class VehicleTypeFactory {
    static getInstance(vehicleType: number | undefined): IVehicleType {
        let iVehicleType: IVehicleType | null = null;
        switch (vehicleType) {
            case 1:
                iVehicleType = new VehicleTypeCar();
                break;
            case 2:
                iVehicleType = new VehicleTypeBus();
                break;
            case 3:
                iVehicleType = new VehicleTypeTruck();
                break;
            case 4:
                iVehicleType = new VehicleTypeBike();
                break;
            case 5:
                iVehicleType = new VehicleTypeJCB();
                break;
            case 6:
                iVehicleType = new VehicleTypeLifter();
                break;
            case 7:
                iVehicleType = new VehicleTypeLoader();
                break;
            case 8:
                iVehicleType = new VehicleTypeMarker();
                break;
            case 9:
                iVehicleType = new VehicleTypePerson();
                break;
            case 10:
                iVehicleType = new VehicleTypePet();
                break;
            case 11:
                iVehicleType = new VehicleTypeShip();
                break;
            case 12:
                iVehicleType = new VehicleTypeTanker();
                break;
            case 13:
                iVehicleType = new VehicleTypeTexi();
                break;
            case 14:
                iVehicleType = new VehicleTypeTractor();
                break;
                case 15:
                    iVehicleType = new VehicleTypeRikshaw();
                    break;
                    case 16:
                        iVehicleType = new VehicleTypeBattery();
                        break;
                        case 17:
                            iVehicleType = new VehicleTypeAmbulance();
                            break;
            default:
                iVehicleType = new VehicleTypeCar();
                break;
        }
        return iVehicleType;
    }


}