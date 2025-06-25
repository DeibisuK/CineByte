import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Actores } from '../admin/models/actores.model';

@Injectable({
  providedIn: 'root'
})
export class ActoresService {

  constructor(private http: HttpClient) { }

  getActor(): Observable<Actores[]> {
    return this.http.get<Actores[]>('http://localhost:3000/api/actores');
  }
}
