import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Idiomas } from '../admin/models/idiomas.model';

@Injectable({
  providedIn: 'root'
})
export class IdiomasService {

  constructor(private http: HttpClient) { }
  getIdiomas(): Observable<Idiomas[]> {
      return this.http.get<Idiomas[]>('http://localhost:3000/api/idiomas');
    }
}
