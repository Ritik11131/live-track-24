
import { NotificationData } from "./app/dashboard/dashboard/domain/notificationdata.model";
import {configModel} from "./app/dashboard/user/configurationDetails/domain/config.model";

export const config = {
  logo: "assets/map_marker.png",
  title: "Unknown",
  layout: 2,
  loginPage:0,
  baseUrl:'https://sapi.livetrack24.in',
  criticalNotifications: ["IgnitionOn", "IgnitionOff"] as (keyof NotificationData)[],
  currentMap: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  configEnable:true,
  subscriptionPlan: false,
  configJson:{androidConfig:{actions:{},options:{},reports:{},permissions:{}},webConfig:{actions:{},options:{},reports:{},permissions:{}}} as configModel,
};

// layout==1 for balin
// layout==2 for torq
// Layout==10 means config file will not be shown

//login page config

//1 for balin
//2 for torq,exter,vivitron

