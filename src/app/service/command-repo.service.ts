import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Command } from '../models/command';

@Injectable({
  providedIn: 'root'
})
export class CommandRepoService {

  constructor(private client: HttpClient) { }

  sendCommand(command: Command): Observable<any> {
    return this.client.post<any>(`${environment.url}/api/Command`, command);
  }
}
