export interface bmsData{
    battery_id:string;
    battery_volt:number;
    battery_current:number;
    soc:number;
    max_cell_vol:number;
    max_cell_vol_no:number;
    min_cell_vol:number;
    min_cell_vol_no:number;
    max_temp:number;
    min_temp:number;
    charging_status:number;
    residual_cap:number;
    charger_status:number;
    load_status:number;
    bms_cycle:number;
    no_of_cell:number;
    no_of_temp_sensor:number;
    temp1:number;
    temp2:number;
    temp3:number;
    temp4:number;
    temp5:number;
    charging_in_kwh:number;
    disCharging_in_kwh:number;
    kms_In_Last_Charge:number
}

export interface OtherData {
  "Charger Status": { value: string; imageUrl: string };
  "BMS Cycle": { value: number; imageUrl: string };
  "Load Status": { value: string; imageUrl: string };
  "Temp Sensors": { value: number; imageUrl: string };
  "No of Cells": { value: number; imageUrl: string };
  "Kms_driven": { value: string; imageUrl: string };
}

  export interface mainData{
    "Voltage":{ value: string; imageUrl: string };
    "Current":{ value: string; imageUrl: string };
    "SOC":{ value: string; imageUrl: string };
    "Residual Capacity":{ value: string; imageUrl: string };
    "Kwh Charging":{ value: number; imageUrl: string };
    "Kwh Discharging":{ value: number; imageUrl: string };

  }
export interface TemperatureData {
    key: string;
    value: number;
}