import { Injectable } from '@angular/core';
import {MessageService} from "primeng/api";

@Injectable({
  providedIn: 'root',
})
export class ToastService {

  constructor(private messageService: MessageService) {}

  toastMessage(severity: string, summary: string, detail: string) {
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail == undefined ? "Something went wrong" : detail,
    });
  }

  showSuccessToast(message: string) {
    this.toastMessage('success', 'Success', message)
  }
  showErrorToast(message: string) {
    this.toastMessage('error', 'Error', message)
  }
  errorToast(err:any) {
    this.toastMessage("error","Message", err.error.data);
  }

}
