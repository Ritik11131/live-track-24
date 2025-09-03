import {
  Injectable,
  ViewContainerRef,
  ComponentFactoryResolver,
  ComponentRef,
} from "@angular/core";
import { Subject, Observable, map } from "rxjs";
import { Device } from "src/app/models/device";
import { SendCommandComponent } from "../presenter/send-command/send-command.component";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
@Injectable({
  providedIn: "root",
})
export class SendCommandService {
  private sendCommanddialogResult = new Subject<string | null>();
  private sendCommandComponentRef?: ComponentRef<SendCommandComponent>;
  constructor(
    private client: HttpClient,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}
  open(
    viewContainerRef: ViewContainerRef,
    devices: string
  ): Observable<string | null> {
    if (this.sendCommandComponentRef) {
      this.sendCommandComponentRef.destroy(); // Ensure any existing dialog is destroyed
    }

    const factory =
      this.componentFactoryResolver.resolveComponentFactory(
        SendCommandComponent
      );
    this.sendCommandComponentRef = viewContainerRef.createComponent(factory);
    this.sendCommandComponentRef.instance.deviceId = devices;

    return this.sendCommanddialogResult.asObservable();
  }

  close(result: string | null) {
    this.sendCommanddialogResult.next(result);
    this.sendCommanddialogResult.complete(); // Close the observable stream
    this.sendCommanddialogResult = new Subject<string | null>(); // Reset the Subject to be ready for new data

    if (this.sendCommandComponentRef) {
      this.sendCommandComponentRef.destroy(); // Destroy the dialog component
      this.sendCommandComponentRef = undefined; // Clean up the reference
    }
  }

  sendCommandData(deviceId: string, command: string): Observable<any> {
    // Prepare the request payload
    const payload = {
      deviceId: deviceId,
      command: command,
    };

    // Make the API call
    return this.client
      .post<any>(`${environment.url}/api/RawLastPoint/sendCommand`, payload)
      .pipe(
        map((res: any) => {
          return res["data"];
        })
      );
  }
}
