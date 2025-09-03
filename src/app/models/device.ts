export interface Device {
  id: number;
  creationTime: number;
  description: string;
  deviceId: string;
  deviceImei: string;
  deviceUid: string | null;
  fkCustomerId: number;
  fkDeviceType: number;
  fkSecSimOperator: number;
  fkSimOperator: number;
  fkVehicleType: number;
  installationOn: string;
  lastUpdateOn: number;
  simPhoneNumber: string;
  simSecPhoneNumber: string;
  vehicleNo: string;
  validity: {
    customerRechargeDate: string;
    installationOn: string;
    nextRechargeDate: string;
  };
  attribute?: {};
}
