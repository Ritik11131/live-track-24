import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationAlert {
  private notificationCount: Subject<number> = new Subject<number>;
  notificationCount$: Observable<number> = this.notificationCount.asObservable();

  constructor() { }
  notificationCountfn(): void {
    this.notificationCount.next(1);
  }
}
