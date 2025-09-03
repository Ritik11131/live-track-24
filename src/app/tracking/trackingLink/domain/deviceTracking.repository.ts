import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { DevicetrackingService } from "./devicetracking.service";

@Injectable()
export class DeviceTrackingRepository {
  constructor(private devicetrackingService: DevicetrackingService) {}

  generateTrackingLink(payload: {
    DeviceId: number;
    validTill: string|undefined;
  }): Observable<any> {
    return new Observable<any>((observer) => {
      this.devicetrackingService.generateTrackingLink(payload).subscribe(
        (data) => {
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
