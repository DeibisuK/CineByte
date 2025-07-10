import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Promocion } from '@core/models';


@Injectable({
  providedIn: 'root'
})
export class PromocionService {
  apiURL = 'https://api-cinebyte.onrender.com/api/promociones';

  constructor(private http: HttpClient) { }

  getPromociones(): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(this.apiURL);
  }

  getPromocionById(id: number): Observable<Promocion> {
    return this.http.get<Promocion>(`${this.apiURL}/${id}`);
  }

  createPromocion(promocion: Promocion): Observable<any> {
    return this.http.post(this.apiURL, promocion);
  }

  updatePromocion(promocion: Promocion): Observable<any> {
    return this.http.put(`${this.apiURL}/${promocion.id_promo}`, promocion);
  }

  deletePromocion(id: number): Observable<any> {
    return this.http.delete(`${this.apiURL}/${id}`);
  }

  getActivePromociones(): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(`${this.apiURL}/activas`);
  }

  validatePromoCode(codigo: string): Observable<any> {
    return this.http.get(`${this.apiURL}/validar/${codigo}`);
  }
}