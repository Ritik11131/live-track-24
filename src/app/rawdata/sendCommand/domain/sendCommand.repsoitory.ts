import { Injectable } from "@angular/core";

import { Observable } from "rxjs";

import { SendCommandService } from "./sendCommand.service";

@Injectable()
export class SendCommandRepository {
  constructor(private sendCommandService: SendCommandService) {}

  sendCommandData(deviceId: string, command: string): Observable<any> {
    return new Observable<any>((observer) => {
      this.sendCommandService.sendCommandData(deviceId, command).subscribe(
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
