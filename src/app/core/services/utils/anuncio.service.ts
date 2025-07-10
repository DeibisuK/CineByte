import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Anuncio } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class AnuncioService {
  private apiUrl = 'https://api-cinebyte.onrender.com/api/anuncios';

  constructor(private http: HttpClient) { }

  getAnuncios(): Observable<Anuncio[]> {
    return this.http.get<Anuncio[]>(this.apiUrl);
  }

  getAnuncioActivo(): Observable<Anuncio | null> {
    return this.http.get<Anuncio[]>(`${this.apiUrl}/activos`).pipe(
      map((anuncios: Anuncio[]) => anuncios.length > 0 ? anuncios[0] : null)
    );
  }

  createAnuncio(anuncio: Anuncio): Observable<Anuncio> {
    return this.http.post<Anuncio>(this.apiUrl, anuncio);
  }

  updateEstadoAnuncio(id: number, estado: 'Activo' | 'Inactivo'): Observable<Anuncio> {
    return this.http.patch<Anuncio>(`${this.apiUrl}/${id}/estado`, { estado });
  }

  deleteAnuncio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
