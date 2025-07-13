import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Idiomas } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class IdiomasService {
  apiURL = 'https://api-cinebyte-akvqp.ondigitalocean.app/api/idiomas';

  constructor(private http: HttpClient) { }

  getIdiomas(): Observable<Idiomas[]> {
    return this.http.get<Idiomas[]>(this.apiURL);
  }
  getIdiomasID(id:number): Observable<Idiomas[]> {
    return this.http.get<Idiomas[]>(`${this.apiURL}/${id}`);
  }
  addIdiomas(form: Idiomas): Observable<any> {
    return this.http.post(this.apiURL, form);
  }
  updateIdiomas(idioma: Idiomas): Observable<any> {
    return this.http.put(`${this.apiURL}/${idioma.id_idioma}`, idioma);
  }
  deleteIdiomas(id: number): Observable<any> {
    return this.http.delete(`${this.apiURL}/${id}`);
  }
}
