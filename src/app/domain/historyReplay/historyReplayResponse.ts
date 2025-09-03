export interface Details {
    ac: boolean;
    adc: number;
    armed: boolean;
    charge: boolean;
    distance: number;
    door: boolean;
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
    versionFw: string;
  }
  
  export interface HistoryReplayResponse {
    details: Details;
    heading: number;
    latitude: number;
    longitude: number;
    serverTime: string;
    speed: number;
    timestamp: string;
    vehicleStatus: number;
  }
  