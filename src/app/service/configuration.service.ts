import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map,BehaviorSubject, Observable, pipe} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ConfigurationService {
    private selectedColorSubject: BehaviorSubject<string> = new BehaviorSubject<string>('indigo');
    selectedColor$: Observable<string> = this.selectedColorSubject.asObservable();
    private selectedThemeSubject: BehaviorSubject<'dark' | 'light'> = new BehaviorSubject<'dark' | 'light'>('light');
    selectedTheme$: Observable<'dark' | 'light'> = this.selectedThemeSubject.asObservable();
  
    constructor() { }
  
    setSelectedColor(color: string): void {
      this.selectedColorSubject.next(color);
    }
    setSelectedTheme(theme:  'dark' | 'light'): void {
      this.selectedThemeSubject.next(theme);
    }

}