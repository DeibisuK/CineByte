import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Generos } from '../admin/models/generos.model';

@Injectable({
  providedIn: 'root'
})
export class GenerosService {
  apiURL = 'http://localhost:3000/api/generos';

  constructor(private http: HttpClient) { }

  getGeneros(): Observable<Generos[]> {
    return this.http.get<Generos[]>(this.apiURL);
  }
  addGenero(formGenero: Generos): Observable<any> {
    return this.http.post(this.apiURL, formGenero);
  }
  deleteGenero(id: number): Observable<any> {
    return this.http.delete(`${this.apiURL}/${id}`);
  }

  getFilms(id: number): Observable<total[]> {
    return this.http.get<total[]>(`${this.apiURL}/total/${id}`);
  }
}

interface total {
  id_genero: number;
  total: number;
}
