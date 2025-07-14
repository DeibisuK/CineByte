import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, sendPasswordResetEmail, authState } from '@angular/fire/auth';
import { getAuth, getIdTokenResult, User } from 'firebase/auth';
import { BehaviorSubject, from, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private roleSubject = new BehaviorSubject<string | null>(null);
  role$ = this.roleSubject.asObservable();

  user$: Observable<User | null>;
  //private apiUrl = 'http://localhost:3000/api/users'
  private apiUrl = 'https://api-cinebyte-akvqp.ondigitalocean.app/api/users'

  constructor(private http: HttpClient, private auth: Auth) {
    this.auth = getAuth();
    this.init();;
    this.user$ = authState(this.auth);
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

  async updateUserRole(user: User) {
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

  isLoggedIn(): boolean {
    return this.auth.currentUser !== null;
  }

  asignarAdmin(uid: string, token: string) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/add-admin`, { uid }, { headers });
  }

  removerAdmin(uid: string, token: string) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/delete-admin/`, { uid }, { headers });
  }

  // Métodos para gestión de empleados
  asignarEmpleado(uid: string, token: string) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/add-employee`, { uid }, { headers });
  }

  removerEmpleado(uid: string, token: string) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/delete-employee`, { uid }, { headers });
  }

  obtenerUsuarios(): Observable<any> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');
    // 🔁 Convertimos la promesa del token a un observable con `from()`
    return from(user.getIdToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get(`${this.apiUrl}/`, { headers });
      })
    );
  }

  buscarUsuarios(texto: string): Observable<any> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    return from(user.getIdToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        let params = new HttpParams();
        if (texto.trim() !== '') {
          params = params.set('search', texto.trim());
        }
        return this.http.get(`${this.apiUrl}/`, { headers, params });
      })
    );
  }

  eliminarUsuario(id: string): Observable<any> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    return from(user.getIdToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.delete(`${this.apiUrl}/${id}`, { headers });
      })
    );
  }

  crearAdmin(email: string, password: string, displayName: string, token: string) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/crear-admin`, {
      email,
      password,
      displayName
    }, { headers });
  } 

  actualizarUsuario(uid: string, data: any, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.put(`${this.apiUrl}/${uid}`, data, { headers });
  }

   async getCurrentUID(): Promise<string | null> {
    const user = await this.auth.currentUser;
    return user ? user.uid : null;
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