import { Injectable, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ConfirmationDialogComponent } from '../presenter/confirmation-dialog/confirmation-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService{

  private dialogResult = new Subject<string | null>();
  private dialogComponentRef?: ComponentRef<ConfirmationDialogComponent>;

  constructor(private componentFactoryResolver: ComponentFactoryResolver,) {}

  open(viewContainerRef: ViewContainerRef, title: string|undefined): Observable<string | null> {
    if (this.dialogComponentRef) {
      this.dialogComponentRef.destroy();  // Ensure any existing dialog is destroyed
    }

    const factory = this.componentFactoryResolver.resolveComponentFactory(ConfirmationDialogComponent);
    this.dialogComponentRef = viewContainerRef.createComponent(factory);
    this.dialogComponentRef.instance.title = title;

    return this.dialogResult.asObservable();
  }

  close(result: string | null) {
    this.dialogResult.next(result);
    this.dialogResult.complete();  // Close the observable stream
    this.dialogResult = new Subject<string | null>();  // Reset the Subject to be ready for new data

    if (this.dialogComponentRef) {
      this.dialogComponentRef.destroy();  // Destroy the dialog component
      this.dialogComponentRef = undefined;  // Clean up the reference
    }
  }}
