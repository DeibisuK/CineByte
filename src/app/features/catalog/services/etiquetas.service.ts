import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Etiquetas } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class EtiquetasService {
  apiURL = 'https://api-cinebyte-akvqp.ondigitalocean.app/api/etiquetas';
  
  constructor(private http: HttpClient) { }

  getEtiquetas(): Observable<Etiquetas[]> {
    return this.http.get<Etiquetas[]>(this.apiURL);
  }
  addEtiquetas(form: Etiquetas): Observable<any> {
    return this.http.post(this.apiURL, form);
  }
  updateEtiquetas(etiqueta: Etiquetas): Observable<any> {
    return this.http.put(`${this.apiURL}/${etiqueta.id_etiqueta}`, etiqueta);
  }
  deleteEtiquetas(id: number): Observable<any> {
    return this.http.delete(`${this.apiURL}/${id}`);
  }
}
