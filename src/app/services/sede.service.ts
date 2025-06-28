import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Sede {
  id_sede: number;
  nombre: string;
  id_ciudad: number;
  direccion: string;
  estado?: string;
  latitud?: number;
  longitud?: number;
  telefono?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})

export class SedeService {
  private apiUrl = 'http://localhost:3000/api/sedes';

  constructor(private http: HttpClient) {}

  crearSede(sede: Sede): Observable<any> {
    return this.http.post(this.apiUrl, sede);
  }

  getCiudades(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:3000/api/ciudades');
  }

  getSedes(): Observable<Sede[]> {
    return this.http.get<Sede[]>(this.apiUrl);
  }

  eliminarSede(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}