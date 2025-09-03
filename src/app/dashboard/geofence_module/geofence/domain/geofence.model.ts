export interface Geofence 
    {
        fkCustomerUserId: number,
        id: number,
        radius: number,
        geofenceGeometry: string,
        geometryName:string,
        color: string,
        isLinked?: boolean;  // Add this property
mappingId?:number|undefined,
isSelected?: boolean;

    }
