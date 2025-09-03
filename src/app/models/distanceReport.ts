export interface DistanceReport {
    id: number,
    fkDeviceId: number,
    vehicleNo: string,
    dateDis: string,
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
    distance: number,
}
