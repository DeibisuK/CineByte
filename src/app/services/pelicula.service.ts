import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pelicula } from '../admin/models/pelicula.model';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class PeliculaService {
  //apiURL = 'https://api-cinebyte.onrender.com/api/peliculas';
  apiURL = 'http://localhost:3000/api/peliculas';
  constructor(private http: HttpClient) { }

  getPeliculas(): Observable<Pelicula[]> {
    return this.http.get<Pelicula[]>(this.apiURL);
  }
  getPeliculaById(id: number): Observable<Pelicula> {
    return this.http.get<Pelicula>(`${this.apiURL}/${id}`);
  }
  addPelicula(peliculaForm: Pelicula): Observable<any> {
    return this.http.post(this.apiURL, peliculaForm);
  }
  updatePelicula(pelicula: Pelicula): Observable<any> {
    return this.http.put(`${this.apiURL}/${pelicula.id_pelicula}`, pelicula);
  }
  deletePelicula(id: number): Observable<any> {
    return this.http.delete(`${this.apiURL}/${id}`);
  }
  getActoresByPeliculaId(id: number): Observable<any> {
    return this.http.get(`${this.apiURL}/actores/${id}`);
  }
  getGenerosByPeliculaId(id: number): Observable<any> {
    return this.http.get(`${this.apiURL}/generos/${id}`);
  }
  getEtiquetasByPeliculaId(id: number): Observable<any> {
    return this.http.get(`${this.apiURL}/etiquetas/${id}`);
  }
  getIdiomasByPeliculaId(id: number): Observable<any> {
    return this.http.get(`${this.apiURL}/idiomas/${id}`);
  }
  getPeliculasCompletas(): Observable<any> {
    return this.http.get(`${this.apiURL}/completas`);
  }
}
