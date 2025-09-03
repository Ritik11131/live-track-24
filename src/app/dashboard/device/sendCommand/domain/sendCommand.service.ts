import { Injectable, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Device } from 'src/app/models/device';
import { SendCommandComponent } from '../presenter/send-command/send-command.component';
@Injectable({
  providedIn: 'root'
})
export class SendCommandService {
  private sendCommanddialogResult = new Subject<string | null>();
  private sendCommandComponentRef?: ComponentRef<SendCommandComponent>;
  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}
  open(viewContainerRef: ViewContainerRef, devices: Device[]): Observable<string | null> {
    if (this.sendCommandComponentRef) {
      this.sendCommandComponentRef.destroy();  // Ensure any existing dialog is destroyed
    }

    const factory = this.componentFactoryResolver.resolveComponentFactory(SendCommandComponent);
    this.sendCommandComponentRef = viewContainerRef.createComponent(factory);
    this.sendCommandComponentRef.instance.devices = devices;

    return this.sendCommanddialogResult.asObservable();
  }

  close(result: string | null) {
    this.sendCommanddialogResult.next(result);
    this.sendCommanddialogResult.complete();  // Close the observable stream
    this.sendCommanddialogResult = new Subject<string | null>();  // Reset the Subject to be ready for new data

    if (this.sendCommandComponentRef) {
      this.sendCommandComponentRef.destroy();  // Destroy the dialog component
      this.sendCommandComponentRef = undefined;  // Clean up the reference
    }
  }}
