import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pelicula } from '../admin/models/pelicula.model';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class PeliculaService {
  apiURL = 'http://localhost:3000/api/peliculas';
  constructor(private http: HttpClient) { }

  obtenerPeliculas(): Observable<Pelicula[]> {
    return this.http.get<Pelicula[]>(this.apiURL);
  }
  
  guardarPelicula(peliculaForm: Pelicula) {    
    this.http.post(this.apiURL, peliculaForm)
      .subscribe(response => {console.log('Película guardada:');});
  }
}
