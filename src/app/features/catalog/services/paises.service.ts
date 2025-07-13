import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pais } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class PaisesService {

  apiURL = 'https://api-cinebyte-akvqp.ondigitalocean.app/api/paises';
  
  constructor(private http: HttpClient) { }

  getPais(): Observable<Pais[]> {
    return this.http.get<Pais[]>(this.apiURL);
  }
  addPais(form: Pais): Observable<any> {
    return this.http.post(this.apiURL, form);
  }
  updatePais(pais: Pais): Observable<any> {
    return this.http.put(`${this.apiURL}/${pais.id_pais}`, pais);
  }
  deletePais(id: number): Observable<any> {
    return this.http.delete(`${this.apiURL}/${id}`);
  }
}
