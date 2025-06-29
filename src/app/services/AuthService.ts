import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, sendPasswordResetEmail } from '@angular/fire/auth';
import { getAuth, getIdTokenResult, User } from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = getAuth();
  private roleSubject = new BehaviorSubject<string | null>(null);
  role$ = this.roleSubject.asObservable();
  constructor(private autho: Auth) {
    this.init();

  }

  private init() {
    this.auth.onAuthStateChanged(user => {
      if (user) {
        this.updateUserRole(user);
      } else {
        this.roleSubject.next(null);
      }
    });
  }

  private async updateUserRole(user: User) {
    try {
      const idTokenResult = await getIdTokenResult(user, true);
      const role = (idTokenResult.claims['role'] as string) || 'cliente';
      this.roleSubject.next(role);
    } catch (error) {
      console.error('Error obteniendo rol:', error);
      this.roleSubject.next(null);
    }
  }

  // Método para forzar actualizar el rol (ej. tras login)
  async refreshRole() {
    const user = this.auth.currentUser;
    if (user) {
      await this.updateUserRole(user);
    } else {
      this.roleSubject.next(null);
    }
  }

  // Obtener rol actual síncrono (no observable)
  getRole(): string | null {
    return this.roleSubject.getValue();
  }

  loginEmail(email: string, password: string) {
    return signInWithEmailAndPassword(this.autho, email, password);
  }

  registerEmail(email: string, password: string) {
    return createUserWithEmailAndPassword(this.autho, email, password);
  }

  loginGoogle() {
    return signInWithPopup(this.autho, new GoogleAuthProvider());
  }

  loginFacebook() {
    return signInWithPopup(this.autho, new FacebookAuthProvider());
  }

  logout() {
    return this.autho.signOut();
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(this.autho, email);
  }

}

(window as any).getIdToken = () => {
  const auth = getAuth();
  if (!auth.currentUser) {
    console.log('No hay usuario logueado');
    return;
  }
  auth.currentUser.getIdToken(true).then(token => console.log(token));
};

(window as any).verClaims = () => {
  const auth = getAuth();
  if (!auth.currentUser) {
    console.log('No hay usuario logueado');
    return;
  }
  auth.currentUser.getIdTokenResult().then(tokenResult => {
    console.log('Claims:', tokenResult.claims);
  });
};