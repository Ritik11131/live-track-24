export interface User {
    id: number;
    fkCustomerId:number;
    fkParentId: number;
    loginId: string;
    userName: string;
    email: string;
    password: string;
    mobileNo: string;
    userType: number;
    creationTime:number;
    isActive:number;
    timezone:string
}
