export interface DetailReport {
    timestamp:string;
    ignstatus:boolean;
    speed:number;
    latlng: { lat: number, lng: number };
    address:string;
    door?:boolean;
    ac?:boolean;
    extVolt?:number;
}