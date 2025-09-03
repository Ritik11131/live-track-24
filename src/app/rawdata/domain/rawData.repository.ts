import { Injectable } from "@angular/core";

import { Observable } from "rxjs";

import { LastListService } from "./last-list.service";
@Injectable()
export class RawDataRepository {
  constructor(private lastListService: LastListService) {}

  getRawData(deviceId: string): Observable<any> {
    return new Observable<any>((observer) => {
      this.lastListService.getRawData(deviceId).subscribe(
        (data) => {
            console.log(data)
          observer.next(data);
          observer.complete();
        },
        (error) => {
          observer.error(error);
        }
      );
    });
  }
}
