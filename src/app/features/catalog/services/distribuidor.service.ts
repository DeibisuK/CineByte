import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Distribuidor } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class DistribuidorService {
  apiURL = 'https://api-cinebyte-akvqp.ondigitalocean.app/api/distribuidor';
  constructor(private http: HttpClient) { }

  getDistribuidor(): Observable<Distribuidor[]> {
    return this.http.get<Distribuidor[]>(this.apiURL);
  }
  addDisitribuidor(distri: Distribuidor):Observable<any> {
    return this.http.post(this.apiURL, distri);
  }
  updateDistribuidor(id: number, distri: Distribuidor): Observable<any> {
    return this.http.put(`${this.apiURL}/${id}`, distri);
  }
  deleteDisitribuidor(id: number): Observable<any> {
    return this.http.delete(`${this.apiURL}/${id}`);
  }
}