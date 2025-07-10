import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Funciones, FuncionesList } from '../admin/models/funciones.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FuncionesService {
  apiURL = 'https://api-cinebyte.onrender.com/api/funciones';
  //apiURL = 'http://localhost:3000/api/funciones';

  constructor(private http: HttpClient) { }

  getFunciones(): Observable<Funciones[]> {
    return this.http.get<Funciones[]>(this.apiURL);
  }

  getFuncionById(id: number): Observable<Funciones> {
    return this.http.get<Funciones>(`${this.apiURL}/${id}`);
  }

  addFuncion(formFuncion: Funciones): Observable<any> {
    return this.http.post(this.apiURL, formFuncion);
  }

  updateFuncion(funcion: Funciones): Observable<any> {
    return this.http.put(`${this.apiURL}/${funcion.id_funcion}`, funcion);
  }

  deleteFuncion(id: number): Observable<any> {
    return this.http.delete(`${this.apiURL}/${id}`);
  }

  getFuncionesConDetalles(): Observable<FuncionesList[]> {
    return this.http.get<FuncionesList[]>(`${this.apiURL}`);
  }

  // Método comentado porque el endpoint no existe en el backend
  // getFuncionesByPeliculaId(peliculaId: number): Observable<Funciones[]> {
  //   return this.http.get<Funciones[]>(`${this.apiURL}/pelicula/${peliculaId}`);
  // }
}
