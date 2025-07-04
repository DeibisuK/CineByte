import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Anuncio } from '../admin/models/anuncio.model';

@Injectable({
  providedIn: 'root',
})
export class AnuncioService {
  private apiUrl = 'http://localhost:3000/api/anuncios';

  constructor(private http: HttpClient) { }

  getAnuncios(): Observable<Anuncio[]> {
    return this.http.get<Anuncio[]>(this.apiUrl);
  }

  getAnuncioActivo(): Observable<Anuncio | null> {
    return this.http.get<Anuncio | null>(`${this.apiUrl}/activo`);
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
