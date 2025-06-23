import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pelicula } from '../admin/models/pelicula.model';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class PeliculaService {

  constructor(private http: HttpClient) { }

  obtenerPeliculas(): Observable<Pelicula[]> {
    return this.http.get<Pelicula[]>('http://localhost:3000/api/peliculas');
  }
  
  guardarPelicula(peliculaForm: Pelicula) {
    this.http.post('http://localhost:3000/api/peliculas', peliculaForm)
      .subscribe(response => {console.log('Película guardada:', response);});
  }

}
