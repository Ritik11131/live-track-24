import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../network/apiService';
import { VehicleListResponse } from '../domain/tracking/vehicleListResponse';

@Injectable({
  providedIn: 'root'
})
export class VehicleListViewModel {

  constructor(private apiService: ApiService) {}

  getVehicleList(): Observable<VehicleListResponse> {

    return this.apiService.getVehicleList();
  }



}
