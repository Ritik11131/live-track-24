import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../network/apiService';
import { CommandRequest } from '../domain/commands/commandRequest';
import { CommandResponse } from '../domain/commands/commandResponse';
import { VehicleDetailResponse } from '../domain/tracking/vehicleDetailResponse';
import { VehicleDetailRequest } from '../domain/tracking/vehicleDetailRequest';
@Injectable({
  providedIn: 'root'
})
export class VehicleDetailViewModel {

  constructor(private apiService: ApiService) {}

  sendCommand(req:CommandRequest): Observable<CommandResponse> {
    return this.apiService.sendCommand(req);
  }


  getVehicleById(req:VehicleDetailRequest): Observable<VehicleDetailResponse> {
    
    return this.apiService.getVehicleById(req);
  }
}
