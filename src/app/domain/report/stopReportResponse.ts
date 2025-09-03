export interface StopRecord {
    fkDeviceId: number;
    latitude: number;
    longitude: number;
    dormantStart: string;  // or Date if you plan to convert it
    dormantEnd: string;    // or Date if you plan to convert it
    vehicleNo: string;
  }
  export interface StopReportResponse {
    result: boolean;
    data: StopRecord[];
}