import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Distribuidor } from '../admin/models/distribuidor.model';

@Injectable({
  providedIn: 'root'
})
export class DistribuidorService {
  apiURL = 'https://api-cinebyte.onrender.com/api/distribuidor';
  constructor(private http: HttpClient) { }

  getDistribuidor(): Observable<Distribuidor[]> {
    return this.http.get<Distribuidor[]>(this.apiURL);
  }
  addDisitribuidor(distri: Distribuidor):Observable<any> {
    return this.http.post(this.apiURL, distri);
  }
}
