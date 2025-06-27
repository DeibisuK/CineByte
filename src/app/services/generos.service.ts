import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Generos } from '../admin/models/generos.model';

@Injectable({
  providedIn: 'root'
})
export class GenerosService {
  apiURL = 'http://localhost:3000/api/generos';
  constructor(private http: HttpClient) { }
  getGeneros(): Observable<Generos[]> {
      return this.http.get<Generos[]>(this.apiURL);
    }
}
