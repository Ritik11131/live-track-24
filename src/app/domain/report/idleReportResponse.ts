export interface IdleRecord {
    fkDeviceId: number;
    latitude: number;
    longitude: number;
    dormantStart: string;  // or Date if you plan to convert it
    dormantEnd: string;    // or Date if you plan to convert it
    vehicleNo: string;
  }
  export interface IdleReportResponse {
    result: boolean;
    data: IdleRecord[];
}