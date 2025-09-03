export interface StopReport {
    dormantStart: string ,
    dormantEnd: string ,
    latitude: number,
    longitude: number,
    fkDeviceId: number,
    vehicleNo: string,
    location?:string,
    duration?:string,
    address?:string,
}
