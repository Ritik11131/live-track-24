// shared-data.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private messageSource = new BehaviorSubject<number>(1);
  currentMessage = this.messageSource.asObservable();

  constructor() { }

  changeMessage(message: number) {
    this.messageSource.next(message);
  }
}
