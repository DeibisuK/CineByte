import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Asiento } from '@core/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsientosService {
  //private apiURL = 'https://api-cinebyte-akvqp.ondigitalocean.app/api/asientos';
  private apiURL = 'http://localhost:3000/api/funciones/asientos';

  constructor(private http: HttpClient) { }

  getAsientos(): Observable<any> {
    return this.http.get<any>(this.apiURL);
  }
}
