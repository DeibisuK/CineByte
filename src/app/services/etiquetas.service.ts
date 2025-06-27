import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Etiquetas } from '../admin/models/etiquetas.model';

@Injectable({
  providedIn: 'root'
})
export class EtiquetasService {
 apiURL= 'https://api-cinebyte.onrender.com/api/etiquetas';
  constructor(private http: HttpClient) { }

  getEtiquetas(): Observable<Etiquetas[]> {
    return this.http.get<Etiquetas[]>(this.apiURL);
  }
}
