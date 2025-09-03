export interface VehicleDetailResponse {
    result: boolean;
    data: {
        device: {
            deviceId: string;
            vehicleNo: string;
            vehicleType: number;
            deviceType: number;
            id: number;
            details: {
                lastOdometer: number;
                lastEngineHours: number;
            };
        };
        position: {
            status: {
                status: string;
                duration: string;
            };
            protocol: string;
            servertime: string;
            deviceTime: string;
            valid: number;
            latitude: number;
            longitude: number;
            speed: number;
            heading: number;
            altitude: number;
            accuracy: number;
            details: {
                ac: boolean;
                adc: number;
                armed: boolean;
                charge: boolean;
                distance: number;
                door: boolean;
                engHours: number;
                extVolt: number;
                ign: boolean;
                intVolt: number;
                motion: boolean;
                rssi: number;
                sat: number;
                sos: boolean;
                totalDistance: number;
                vDuration: number;
                vStatus: string;
                versionFw: string;
            };
        };
        validity: {
            installationOn: string;
            nextRechargeDate: string;
            customerRechargeDate: string;
        };
    };
}
