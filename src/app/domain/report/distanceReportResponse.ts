export interface DistanceReportRecord {
    id: number;
    dateDis: string; // Consider using Date if you will parse this string to a Date object
    fkDeviceId: number;
    vehicleNo: string;
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    fromTime: string | null; // Consider using Date if you will parse this string to a Date object
    toTime: string | null;   // Consider using Date if you will parse this string to a Date object
    distance: number;
}

export interface DistanceReportReponse {
    data: DistanceReportRecord[];
    result: boolean;
}
