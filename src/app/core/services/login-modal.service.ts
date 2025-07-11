import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginModalService {
  private showModalSubject = new BehaviorSubject<boolean>(false);
  public showModal$ = this.showModalSubject.asObservable();

  openModal() {
    this.showModalSubject.next(true);
  }

  closeModal() {
    this.showModalSubject.next(false);
  }
}
