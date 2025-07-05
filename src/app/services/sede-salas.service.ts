import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SedeSala, Sede, Sala, CreateSedeSalaRequest, CreateMultipleSedeSalaRequest } from '../admin/models/sede_salas.model';

@Injectable({
  providedIn: 'root'
})
export class SedeSalasService {
  private apiUrl = 'http://localhost:3000/api/sede-salas';
  private sedesUrl = 'http://localhost:3000/api/sedes';
  private salasUrl = 'http://localhost:3000/api/salas';

  constructor(private http: HttpClient) { }

  // CRUD básico
  getSedesSalas(): Observable<SedeSala[]> {
    return this.http.get<SedeSala[]>(this.apiUrl);
  }

  getSedeSalaById(id: number): Observable<SedeSala> {
    return this.http.get<SedeSala>(`${this.apiUrl}/${id}`);
  }

  createSedeSala(sedeSala: CreateSedeSalaRequest): Observable<SedeSala> {
    return this.http.post<SedeSala>(this.apiUrl, sedeSala);
  }

  createMultipleSedesSalas(request: CreateMultipleSedeSalaRequest): Observable<SedeSala[]> {
    return this.http.post<SedeSala[]>(`${this.apiUrl}/multiple`, request);
  }

  updateSedeSala(id: number, sedeSala: CreateSedeSalaRequest): Observable<SedeSala> {
    return this.http.put<SedeSala>(`${this.apiUrl}/${id}`, sedeSala);
  }

  deleteSedeSala(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  deleteMultipleSedesSalas(ids: number[]): Observable<any> {
    return this.http.delete(`${this.apiUrl}/multiple`, { body: { ids } });
  }

  // Consultas específicas
  getSalasBySede(idSede: number): Observable<SedeSala[]> {
    return this.http.get<SedeSala[]>(`${this.apiUrl}/sede/${idSede}`);
  }

  getSedesBySala(idSala: number): Observable<SedeSala[]> {
    return this.http.get<SedeSala[]>(`${this.apiUrl}/sala/${idSala}`);
  }

  // Disponibilidad
  getSalasDisponibles(idSede: number): Observable<Sala[]> {
    return this.http.get<Sala[]>(`${this.apiUrl}/disponibles/salas/${idSede}`);
  }

  getSedesDisponibles(idSala: number): Observable<Sede[]> {
    return this.http.get<Sede[]>(`${this.apiUrl}/disponibles/sedes/${idSala}`);
  }

  // Obtener todas las sedes y salas
  getSedes(): Observable<Sede[]> {
    return this.http.get<Sede[]>(this.sedesUrl);
  }

  getSalas(): Observable<Sala[]> {
    return this.http.get<Sala[]>(this.salasUrl);
  }
}
