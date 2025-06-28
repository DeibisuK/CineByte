import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TemaService {
  private modoOscuroSubject = new BehaviorSubject<boolean>(true);
  public modoOscuro$ = this.modoOscuroSubject.asObservable();

  constructor() {
    // Opcional: Cargar preferencia guardada en localStorage
    const savedMode = localStorage.getItem('modoOscuro');
    if (savedMode) {
      this.setModoOscuro(savedMode === 'true');
    }
  }

  setModoOscuro(valor: boolean): void {
    this.modoOscuroSubject.next(valor);
    // Opcional: Guardar preferencia
    localStorage.setItem('modoOscuro', valor.toString());
    
    // Aplicar clase al body
    if (valor) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }

  toggleModoOscuro(): void {
    this.setModoOscuro(!this.modoOscuroSubject.getValue());
  }

  getModoOscuro(): boolean {
    return this.modoOscuroSubject.getValue();
  }
}