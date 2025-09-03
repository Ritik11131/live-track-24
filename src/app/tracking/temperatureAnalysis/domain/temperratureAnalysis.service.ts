import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TemperatureAnalysisService {
  private tempGraphData: any = null;

  constructor() {}

  saveData(data: any): void {
    this.tempGraphData = data;
  }

  getData(): any {
    return this.tempGraphData;
  }

  clearData(): void {
    this.tempGraphData = null;
  }
}
