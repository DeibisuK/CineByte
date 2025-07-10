import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Asiento } from '@core/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsientosService {
  private apiURL = 'https://api-cinebyte.onrender.com/api/asientos';

  constructor(private http: HttpClient) { }

  getAsientosPorSala(idSala: number): Observable<Asiento[]> {
    return this.http.get<Asiento[]>(`${this.apiURL}/sala/${idSala}`);
  }

  updateAsientoOcupado(idAsiento: number, ocupado: boolean): Observable<any> {
    return this.http.patch(`${this.apiURL}/${idAsiento}/ocupado`, { ocupado });
  }

  reservarAsientos(asientos: number[]): Observable<any> {
    return this.http.post(`${this.apiURL}/reservar`, { asientos });
  }

  liberarAsientos(asientos: number[]): Observable<any> {
    return this.http.post(`${this.apiURL}/liberar`, { asientos });
  }
}
