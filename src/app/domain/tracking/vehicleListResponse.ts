export interface VehicleListResponse {
    result: boolean;
    data: DeviceData[];
  }
  
  export interface DeviceData {
    device: Device;
    position: Position;
    validity: Validity;
  }
  
  export interface Device {
    deviceId: string;
    vehicleNo: string;
    details: DeviceDetails;
    vehicleType: number;
    deviceType: number;
    id: number;
  }
  
  export interface DeviceDetails {
    speedLimit: number;
    lastOdometer: number;
    lastEngineHours: number;
  }
  
  export interface Position {
    accuracy: number;
    altitude: number;
    details: PositionDetails;
    deviceTime: string;
    heading: number;
    latitude: number;
    longitude: number;
    protocol: string;
    servertime: string;
    speed: number;
    status: Status;
    valid: number;
  }
  
  export interface PositionDetails {
    armed: boolean;
    avl06: number;
    avl09: string;
    avl10: string;
    charge: boolean;
    distance: number;
    engHours: number;
    extVolt: number;
    ign: boolean;
    intVolt: number;
    motion: boolean;
    rssi: number;
    sat: number;
    sos: boolean;
    totalDistance: number;
    vDuration: number;
    vStatus: string;
  }
  
  export interface Status {
    status: string;
    duration: string;
  }
  
  export interface Validity {
    installationOn: string;
    nextRechargeDate: string;
    customerRechargeDate: string;
  }
  