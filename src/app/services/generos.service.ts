import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Generos } from '../admin/models/generos.model';

@Injectable({
  providedIn: 'root'
})
export class GenerosService {
  apiURL = 'https://api-cinebyte.onrender.com/api/generos';

  constructor(private http: HttpClient) { }

  getGeneros(): Observable<Generos[]> {
    return this.http.get<Generos[]>(this.apiURL);
  }
  addGenero(formGenero: Generos): Observable<any> {
    return this.http.post(this.apiURL, formGenero);
  }
  updateGenero(genero: Generos): Observable<any> {
    return this.http.put(`${this.apiURL}/${genero.id_genero}`, genero);
  }
  deleteGenero(id: number): Observable<any> {
    return this.http.delete(`${this.apiURL}/${id}`);
  }
}
