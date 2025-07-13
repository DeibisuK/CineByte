import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActorCreateDTO, Actores, ActorUpdateDTO } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class ActoresService {
  private apiURL = 'https://api-cinebyte-akvqp.ondigitalocean.app/api/actores';

  constructor(private http: HttpClient) {}

  getActor(): Observable<Actores[]> {
    return this.http.get<Actores[]>(this.apiURL);
  }

  getActorById(id: number): Observable<Actores> {
    return this.http.get<Actores>(`${this.apiURL}/${id}`);
  }

  addActor(actor: ActorCreateDTO): Observable<Actores> {
    return this.http.post<Actores>(this.apiURL, actor);
  }

  updateActor(id: number, actor: ActorUpdateDTO): Observable<Actores> {
    return this.http.put<Actores>(`${this.apiURL}/${id}`, actor);
  }

  deleteActor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }
}