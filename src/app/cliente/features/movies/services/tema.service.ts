import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TemaService {
  private modoOscuroSubject = new BehaviorSubject<boolean>(true);
  modoOscuro$ = this.modoOscuroSubject.asObservable();

  setModoOscuro(valor: boolean) {
    this.modoOscuroSubject.next(valor);
  }

  getModoOscuro(): boolean {
    return this.modoOscuroSubject.getValue();
  }
}
