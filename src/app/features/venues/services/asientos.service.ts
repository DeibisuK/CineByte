import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Asiento } from '@core/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsientosService {
  private apiURL = 'https://api-cinebyte-akvqp.ondigitalocean.app/api/asientos';
 // private apiURL = 'http://localhost:3000/api/asientos';

  constructor(private http: HttpClient) { }

  // Método original para obtener asientos de una sala (sin ocupación por función)
  getAsientosPorSala(idSala: number): Observable<Asiento[]> {
    return this.http.get<Asiento[]>(`${this.apiURL}/sala/${idSala}`);
  }

  // ✅ NUEVO: Obtener asientos disponibles para una función específica
  getAsientosDisponiblesPorFuncion(idSala: number, idFuncion: number): Observable<Asiento[]> {
    return this.http.get<Asiento[]>(`${this.apiURL}/disponibles/${idSala}/${idFuncion}`);
  }

  // ✅ NUEVO: Obtener ocupación de una función específica
  getOcupacionPorFuncion(idFuncion: number): Observable<{
    id_funcion: number;
    sala: string;
    id_sala: number;
    total_asientos: number;
    asientos_vendidos: number;
    asientos_disponibles: number;
    porcentaje_ocupacion: number;
  }> {
    return this.http.get<any>(`${this.apiURL}/ocupacion/${idFuncion}`);
  }

  // ⚠️ DEPRECADO: Este método ya no es necesario con el nuevo sistema
  updateAsientoOcupado(idAsiento: number, ocupado: boolean): Observable<any> {
    console.warn('updateAsientoOcupado está deprecado. La ocupación ahora se maneja por función.');
    return this.http.patch(`${this.apiURL}/${idAsiento}/ocupado`, { ocupado });
  }

  // ⚠️ DEPRECADO: Los asientos se reservan a través de las ventas
  reservarAsientos(asientos: number[]): Observable<any> {
    console.warn('reservarAsientos está deprecado. Use el servicio de ventas.');
    return this.http.post(`${this.apiURL}/reservar`, { asientos });
  }

  // ⚠️ DEPRECADO: Los asientos se liberan cancelando ventas
  liberarAsientos(asientos: number[]): Observable<any> {
    console.warn('liberarAsientos está deprecado. Use cancelar venta.');
    return this.http.post(`${this.apiURL}/liberar`, { asientos });
  }
}
