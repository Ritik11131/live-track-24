export const DefaultConfig = {
  webConfig: {
    actions: {
      bootLock: true,
      historyReplay: true,
      immobilizer: true,
      navigateToGoogle: true,
      setOverSpeed: true,
      trackingLink: true,
      wheelLock: true,
    },
    options: {
      ac: true,
      bmsSOC: true,
      door: true,
      extBattery: true,
      gps: true,
      immobilizer: true,
      intBattery: true,
      odometer: true,
      power: true,
      speed: true,
      temperature: true,
      todayKms: true,
      wheelLock: false,
    },
    reports: {
      acReport: false,
      detailReport: true,
      distanceReport: true,
      idleReport: true,
      overspeedReport: true,
      socReport: true,
      stopReport: true,
      tripReport: true,
      totalDistanceReport:true,
      temperatureReport:true
    },
    permissions:{
      deleteDevice:false,
      createDealer:true
    }
  },
  androidConfig: {
    actions: {
      bootLock: false,
      historyReplay: true,
      immobilizer: false,
      navigateToGoogle: true,
      setOverSpeed: true,
      trackingLink: true,
      wheelLock: false,
    },
    options: {
      ac: false,
      bmsSOC: false,
      door: false,
      extBattery: true,
      gps: true,
      immobilizer: false,
      intBattery: false,
      odometer: true,
      power: true,
      speed: true,
      temperature: false,
      todayKms: true,
      wheelLock: false,
    },
    reports: {
      acReport: false,
      detailReport: true,
      distanceReport: true,
      idleReport: true,
      overspeedReport: true,
      socReport: false,
      stopReport: true,
      tripReport: true,
      temperatureReport:false,
      totalDistanceReport:true,
    },
    permissions:{
      deleteDevice:false,
      createDealer:false
    }
  },
};
  