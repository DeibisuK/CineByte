import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Idiomas } from '../admin/models/idiomas.model';

@Injectable({
  providedIn: 'root'
})
export class IdiomasService {
apiURL = 'https://api-cinebyte.onrender.com/api/idiomas';
  constructor(private http: HttpClient) { }
  getIdiomas(): Observable<Idiomas[]> {
      return this.http.get<Idiomas[]>(this.apiURL);
    }
}
