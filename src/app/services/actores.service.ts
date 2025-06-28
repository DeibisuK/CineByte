import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Actores } from '../admin/models/actores.model';

@Injectable({
  providedIn: 'root'
})
export class ActoresService {
  apiURL = 'https://api-cinebyte.onrender.com/api/actores';

  constructor(private http: HttpClient) { }

  getActor(): Observable<Actores[]> {
    return this.http.get<Actores[]>(this.apiURL);
  }

  addActor(actorForm: Actores) {
    this.http.post(this.apiURL, actorForm)
      .subscribe(response => { console.log('Actor guardado', response); });
  }
}
