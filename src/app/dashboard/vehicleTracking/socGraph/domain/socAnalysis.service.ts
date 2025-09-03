import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SocAnalysisService {
  private socGraphData: any = null;

  constructor() {}

  saveData(data: any): void {
    this.socGraphData = data;
  }

  getData(): any {
    return this.socGraphData;
  }

  clearData(): void {
    this.socGraphData = null;
  }
}
