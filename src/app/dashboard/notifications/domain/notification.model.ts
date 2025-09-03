export interface Notification {
   eventtime:string,
   details: {
       dTime:string,
       dir: number,
       lat: number,
       lng: number,
       ptl:string,
       spd: number,
       uId:string,
       vNo:string,
       address?:string
    },
   deviceid: number,
   type:string
}