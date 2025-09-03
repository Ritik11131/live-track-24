interface Actions {
    bootLock: boolean;
    historyReplay: boolean;
    immobilizer: boolean;
    navigateToGoogle: boolean;
    setOverSpeed: boolean;
    trackingLink: boolean;
    wheelLock: boolean;
}

interface Options {
    ac: boolean;
    bmsSOC: boolean;
    door: boolean;
    extBattery: boolean;
    gps: boolean;
    immobilizer: boolean;
    intBattery: boolean;
    odometer: boolean;
    power: boolean;
    speed: boolean;
    temperature: boolean;
    todayKms: boolean;
    wheelLock: boolean;
}

interface Reports {
    acReport: boolean;
    detailReport: boolean;
    distanceReport: boolean;
    idleReport: boolean;
    overspeedReport: boolean;
    socReport: boolean;
    stopReport: boolean;
    tripReport: boolean;
    temperatureReport: boolean;
}

interface Permissions {
    deleteDevice: boolean;
    createUser?: boolean;
    createDealer?: boolean;
}

interface Config {
    actions: Actions;
    options: Options;
    reports: Reports;
    permissions: Permissions;
}

export interface configModel {
    webConfig: Config;
    androidConfig: Config;
}
