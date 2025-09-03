// import {Injectable} from '@angular/core';
// import {Observable, Subject} from "rxjs";
// import {HelperMap, MapData} from "../../../helper-map";

// @Injectable({
//     providedIn: 'root'
// })
// export class PushDataService {

//     private observe: Subject<any> = new Subject<any>();
//     map!: HelperMap<MapData>;

//     constructor() {
//     }

//     pushData(data: MapData, map: HelperMap<MapData>): void {
//         this.observe.next({map: map, data: data});
//     }

//     get subscribe(): Observable<any> {
//         return this.observe.asObservable();
//     }
// }
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HelperMap, MapData } from '../../helper-map';

@Injectable({
  providedIn: 'root'
})
export class PushDataService {

  private observe: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  map!: HelperMap<MapData>;

  constructor() {
  }

  pushData(data: MapData, map: HelperMap<MapData>): void {
    this.observe.next({ map: map, data: data });
  }

  get subscribe(): Observable<any> {
    return this.observe.asObservable();
  }
}
