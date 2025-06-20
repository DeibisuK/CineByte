import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, sendPasswordResetEmail } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth: Auth) {}

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
    return sendPasswordResetEmail(this.auth, email); // ✅ usa el mismo objeto
  }
}
