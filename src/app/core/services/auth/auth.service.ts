import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, sendPasswordResetEmail, authState } from '@angular/fire/auth';
import { getAuth, getIdTokenResult, User } from 'firebase/auth';
import { BehaviorSubject, from, Observable, switchMap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private roleSubject = new BehaviorSubject<string | null>(null);
  role$ = this.roleSubject.asObservable();

  user$: Observable<User | null>;
  private tokenValidationService?: any; // Lo inyectaremos dinámicamente para evitar dependencias circulares

  constructor(
    private http: HttpClient, 
    private auth: Auth,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.auth = getAuth();
    this.init();
    this.user$ = authState(this.auth);
  }

  private init() {
    this.auth.onAuthStateChanged(user => {
      if (user) {
        this.updateUserRole(user);
        this.startTokenValidation();
      } else {
        this.roleSubject.next(null);
        this.stopTokenValidation();
      }
    });
  }

  private async startTokenValidation() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        // Importar dinámicamente para evitar dependencias circulares
        const { TokenValidationService } = await import('../token-validation.service');
        // Aquí necesitarías una manera de obtener la instancia del servicio
        // Por ahora, implementaremos la validación directamente
        this.scheduleTokenValidation();
      } catch (error) {
        console.error('Error iniciando validación de token:', error);
      }
    }
  }

  private stopTokenValidation() {
    // Limpiar cualquier timer de validación activo
    if ((this as any).validationTimer) {
      clearInterval((this as any).validationTimer);
      (this as any).validationTimer = null;
    }
  }

  private scheduleTokenValidation() {
    // Validar el token cada 30 segundos
    (this as any).validationTimer = setInterval(async () => {
      try {
        const user = this.auth.currentUser;
        if (user) {
          // Intentar obtener un token fresco
          await user.getIdToken(true);
        }
      } catch (error: any) {
        console.warn('Token posiblemente revocado:', error);
        
        // Si el error indica token revocado, cerrar sesión
        if (this.isTokenRevokedError(error)) {
          console.warn('🔒 Token revocado detectado - Cerrando sesión automáticamente...');
          this.logout();
        }
      }
    }, 30000);
  }

  private isTokenRevokedError(error: any): boolean {
    const errorCode = error?.code || '';
    return (
      errorCode === 'auth/id-token-revoked' ||
      errorCode === 'auth/user-token-expired' ||
      errorCode === 'auth/user-disabled'
    );
  }

  async updateUserRole(user: User) {
    try {
      const idTokenResult = await getIdTokenResult(user, true);
      const claims = idTokenResult.claims;
      
      // Usar el nuevo formato de claims
      let role = 'user'; // por defecto
      
      if (claims['isAdmin'] === true) {
        role = 'admin';
      } else if (claims['isEmployee'] === true) {
        role = 'employee';
      } else if (claims['role']) {
        role = claims['role'] as string;
      }
      
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

  // === MÉTODOS DE AUTENTICACIÓN BÁSICA ===

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

  async getCurrentUID(): Promise<string | null> {
    const user = this.auth.currentUser;
    return user ? user.uid : null;
  }

  // === MÉTODOS PARA OBTENER TOKENS Y CLAIMS ===

  /**
   * Obtener token de autorización del usuario actual
   */
  async getAuthToken(): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    
    try {
      return await user.getIdToken(true); // Forzar refresh del token
    } catch (error) {
      console.error('Error obteniendo token:', error);
      throw new Error('No se pudo obtener el token de autenticación');
    }
  }

  /**
   * Obtener headers con autorización
   */
  async getAuthHeaders(): Promise<HttpHeaders> {
    const token = await this.getAuthToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  /**
   * Obtener claims actuales del usuario autenticado
   */
  async obtenerClaimsActuales(): Promise<any> {
    const user = this.auth.currentUser;
    if (!user) return null;

    try {
      const tokenResult = await getIdTokenResult(user, true);
      return {
        role: tokenResult.claims['role'] || 'user',
        isAdmin: Boolean(tokenResult.claims['isAdmin']) || false,
        isEmployee: Boolean(tokenResult.claims['isEmployee']) || false,
        customClaims: tokenResult.claims
      };
    } catch (error) {
      console.error('Error obteniendo claims:', error);
      return null;
    }
  }

  /**
   * Verificar si el usuario actual tiene un rol específico
   */
  async tieneRol(rol: string): Promise<boolean> {
    const claims = await this.obtenerClaimsActuales();
    if (!claims) return false;
    
    switch (rol) {
      case 'admin':
        return claims.isAdmin === true;
      case 'employee':
        return claims.isEmployee === true;
      case 'user':
        return claims.role === 'user' || (!claims.isAdmin && !claims.isEmployee);
      default:
        return claims.role === rol;
    }
  }
}

// Funciones de utilidad para debugging
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