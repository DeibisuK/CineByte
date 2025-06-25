import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Etiquetas } from '../admin/models/etiquetas.model';

@Injectable({
  providedIn: 'root'
})
export class EtiquetasService {

  constructor(private http: HttpClient) { }

  getEtiquetas(): Observable<Etiquetas[]> {
    return this.http.get<Etiquetas[]>('http://localhost:3000/api/etiquetas');
  }
}
