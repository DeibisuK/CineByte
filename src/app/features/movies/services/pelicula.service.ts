import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pelicula } from '@core/models';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PeliculaService {
  apiURL = 'https://api-cinebyte.onrender.com/api/peliculas';
  funcionesApiURL = 'https://api-cinebyte.onrender.com/api/funciones';
  //apiURL = 'http://localhost:3000/api/peliculas';
  //funcionesApiURL = 'http://localhost:3000/api/funciones';
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

  getPeliculaByIdComplete(id: number): Observable<Pelicula> {
    return this.http.get<Pelicula>(`${this.apiURL}/completas/${id}`);
  }

  getFuncionesByPeliculaId(id: number): Observable<any> {
    return this.http.get(`${this.funcionesApiURL}/pelicula/${id}`);
  }
  buscarPelicula(termino: string): Observable<Pelicula | undefined> {
    return this.getPeliculas().pipe(
      map((peliculas: Pelicula[]) =>
        peliculas.find((pelicula: Pelicula) => pelicula.titulo.toLowerCase().includes(termino.toLowerCase()))
      )
    );
  }
}

