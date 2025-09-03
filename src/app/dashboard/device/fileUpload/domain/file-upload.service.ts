import { Injectable, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { FileUploadComponent } from '../presenter/file-upload/file-upload.component';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService{

  private dialogResult = new Subject<string | null>();
  private FileUploadComponentRef?: ComponentRef<FileUploadComponent>;

  constructor(private componentFactoryResolver: ComponentFactoryResolver,) {}

  open(viewContainerRef: ViewContainerRef, userId: number): Observable<string | null> {
    if (this.FileUploadComponentRef) {
      this.FileUploadComponentRef.destroy();  // Ensure any existing dialog is destroyed
    }

    const factory = this.componentFactoryResolver.resolveComponentFactory(FileUploadComponent);
    this.FileUploadComponentRef = viewContainerRef.createComponent(factory);
    this.FileUploadComponentRef.instance.userId = userId;

    return this.dialogResult.asObservable();
  }

  close(result: string | null) {
    this.dialogResult.next(result);
    this.dialogResult.complete();  // Close the observable stream
    this.dialogResult = new Subject<string | null>();  // Reset the Subject to be ready for new data

    if (this.FileUploadComponentRef) {
      this.FileUploadComponentRef.destroy();  // Destroy the dialog component
      this.FileUploadComponentRef = undefined;  // Clean up the reference
    }
  }}
