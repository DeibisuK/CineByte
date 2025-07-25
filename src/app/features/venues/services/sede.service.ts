import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Sede {
  id_sede?: number;
  nombre: string;
  direccion: string;
  estado: string;
  latitud?: number;
  longitud?: number;
  telefono?: string;
  email?: string;
  ciudad: string;
}

@Injectable({
  providedIn: 'root'
})

export class SedeService {
  private apiUrl = 'https://api-cinebyte-akvqp.ondigitalocean.app/api/sedes';

  constructor(private http: HttpClient) { }

  crearSede(sede: Sede): Observable<any> {
    return this.http.post(this.apiUrl, sede);
  }

  getSedes(): Observable<Sede[]> {
    return this.http.get<Sede[]>(this.apiUrl);
  }

  getSedeById(id: number): Observable<Sede> {
    return this.http.get<Sede>(`${this.apiUrl}/${id}`);
  }

  editarSede(id: number, sede: Sede): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, sede);
  }

  eliminarSede(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en kilómetros
  }


}