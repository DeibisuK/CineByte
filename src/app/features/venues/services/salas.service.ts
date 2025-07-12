import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Asiento, Sala } from '@core/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalasService {
  private apiURL = 'https://api-cinebyte.onrender.com/api/salas';
  //private apiURL = 'http://localhost:3000/api/salas';

  constructor(private http: HttpClient) { }

  getSalas(): Observable<Sala[]> {
    return this.http.get<Sala[]>(this.apiURL);
  }

  addSala(sala: Sala): Observable<any> {
    return this.http.post(this.apiURL, sala);
  }

  updateSala(id:number,sala: Sala): Observable<any> {
    return this.http.put(`${this.apiURL}/${id}`, sala);
  }

  deleteSala(id: number): Observable<any> {
    return this.http.delete(`${this.apiURL}/${id}`);
  }

  getSalaById(id: number): Observable<Sala> {
    return this.http.get<Sala>(`${this.apiURL}/${id}`);
  }

   getAsientosPorSala(id: number): Observable<Asiento[]> {
    return this.http.get<Asiento[]>(`${this.apiURL}/asientos/${id}`);
  }
}
