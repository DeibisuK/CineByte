import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, sendPasswordResetEmail } from '@angular/fire/auth';
import { getAuth, getIdTokenResult, User } from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private roleSubject = new BehaviorSubject<string | null>(null);
  role$ = this.roleSubject.asObservable();
  constructor(private auth: Auth) {
    this.auth = getAuth();
    this.init();;

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
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  registerEmail(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  loginGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  loginFacebook() {
    return signInWithPopup(this.auth, new FacebookAuthProvider());
  }

  logout() {
    return this.auth.signOut();
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  getUsuarioActual(): User | null {
    return this.auth.currentUser;
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