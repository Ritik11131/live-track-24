import { Injectable, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ButtondialogComponent } from '../presenter/buttondialog/buttondialog.component';
@Injectable({
  providedIn: 'root'
})
export class ButtonDialogService{

  private dialogResult = new Subject<string | null>();
  private dialogComponentRef?: ComponentRef<ButtondialogComponent>;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  open(viewContainerRef: ViewContainerRef, title: string,buttonOneValue:string,buttonTwoValue:string,illustration:string): Observable<string | null> {
    if (this.dialogComponentRef) {
      this.dialogComponentRef.destroy();  // Ensure any existing dialog is destroyed
    }

    const factory = this.componentFactoryResolver.resolveComponentFactory(ButtondialogComponent);
    this.dialogComponentRef = viewContainerRef.createComponent(factory);
    this.dialogComponentRef.instance.title = title;
    this.dialogComponentRef.instance.buttonOneValue = buttonOneValue;

    this.dialogComponentRef.instance.buttonTwoValue = buttonTwoValue;
    this.dialogComponentRef.instance.illustration = illustration;


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
  }

}
