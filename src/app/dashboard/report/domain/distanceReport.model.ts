export class DistanceReport {
    constructor(
        public id: number,
        public fkDeviceId: number,
        public vehicleNo: string,
        public dateDis: string,
        public startLat: number,
        public startLng: number,
        public endLat: number,
        public endLng: number,
        public distance: number,
        public startAddress?: string,
        public endAddress?: string
    ) {}
}
