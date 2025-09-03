export interface TripRecord {
    id: number;
    fkDeviceId: number;
    tripStartTime: string; // Consider using Date if you will parse this string to a Date object
    startLat: number;
    startLng: number;
    startAddress: string | null;
    tripEndTime: string; // Consider using Date if you will parse this string to a Date object
    endLat: number;
    endLng: number;
    endAddress: string | null;
    distance: number;
    avgSpeed: number | null;
    maxSpeed: number | null;
}

export interface TripReportResponse {
    result: boolean;
    data: TripRecord[];
}