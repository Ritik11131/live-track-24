export interface SpeedRecord {
    fkDeviceId: number;
    vehicleNo: string;
    speedStartTime: string; // Consider using Date if you will parse this string to a Date object
    startLat: number;
    startLng: number;
    startSpeed: number;
    startAddress: string | null;
    speedEndTime: string; // Consider using Date if you will parse this string to a Date object
    endLat: number;
    endLng: number;
    endSpeed: number;
    endAddress: string | null;
    distance: number;
}

export interface OverspeedReportResponse {
    result: boolean;
    data: SpeedRecord[];
}
