import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GenerosService {
  constructor(private http: HttpClient) { }
  getGeneros(): Observable<string[]> {
      return this.http.get<string[]>('http://localhost:3000/api/generos');
    }
}
