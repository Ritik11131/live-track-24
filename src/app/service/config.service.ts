import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private setConfigSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  setConfigSubject$: Observable<boolean> = this.setConfigSubject.asObservable();

  constructor() { }
  setConfigSubjectfn(color: boolean): void {
    this.setConfigSubject.next(color);
  }
}
