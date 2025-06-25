import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Distribuidor } from '../admin/models/distribuidor.model';

@Injectable({
  providedIn: 'root'
})
export class DistribuidorService {

  constructor(private http: HttpClient) { }

  getDistribuidor(): Observable<Distribuidor[]> {
    return this.http.get<Distribuidor[]>('http://localhost:3000/api/distribuidor');
  }
}
