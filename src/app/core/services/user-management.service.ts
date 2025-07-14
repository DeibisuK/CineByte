import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, from, switchMap, map, catchError, throwError } from 'rxjs';
import { UserProfile, CustomClaims } from '@core/models/users.model';
import { AuthService } from '@core/services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = 'http://localhost:3000/api/users';
  // private apiUrl = 'https://api-cinebyte-akvqp.ondigitalocean.app/api/users'; // Para producción

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Helper para hacer peticiones HTTP con autenticación
   */
  private makeAuthenticatedRequest<T>(
    requestFn: (headers: any) => Observable<T>
  ): Observable<T> {
    return from(this.authService.getAuthHeaders()).pipe(
      switchMap(headers => requestFn(headers)),
      catchError(this.handleError)
    );
  }

  // === OPERACIONES BÁSICAS ===

  /**
   * Listar todos los usuarios
   */
  listarUsuarios(): Observable<UserProfile[]> {
    return this.makeAuthenticatedRequest(headers => 
      this.http.get<UserProfile[]>(this.apiUrl, { headers })
    );
  }

  /**
   * Buscar usuarios por texto
   */
  buscarUsuarios(searchText: string): Observable<UserProfile[]> {
    return this.makeAuthenticatedRequest(headers => {
      let params = new HttpParams();
      if (searchText.trim() !== '') {
        params = params.set('search', searchText.trim());
      }
      return this.http.get<UserProfile[]>(this.apiUrl, { headers, params });
    });
  }

  /**
   * Obtener detalles de un usuario específico
   */
  obtenerUsuario(uid: string): Observable<UserProfile> {
    return this.makeAuthenticatedRequest(headers => 
      this.http.get<UserProfile>(`${this.apiUrl}/${uid}`, { headers })
    );
  }

  /**
   * Obtener perfil del usuario actual
   */
  obtenerPerfilActual(): Observable<UserProfile> {
    return this.makeAuthenticatedRequest(headers => 
      this.http.get<UserProfile>(`${this.apiUrl}/me`, { headers })
    );
  }

  // === GESTIÓN DE ROLES ===

  /**
   * Asignar rol de administrador
   */
  asignarRolAdmin(uid: string): Observable<any> {
    return this.makeAuthenticatedRequest(headers => 
      this.http.post(`${this.apiUrl}/add-admin`, { uid }, { headers })
    );
  }

  /**
   * Remover rol de administrador
   */
  removerRolAdmin(uid: string): Observable<any> {
    return this.makeAuthenticatedRequest(headers => 
      this.http.post(`${this.apiUrl}/delete-admin`, { uid }, { headers })
    );
  }

  /**
   * Asignar rol de empleado
   */
  asignarRolEmpleado(uid: string): Observable<any> {
    return this.makeAuthenticatedRequest(headers => 
      this.http.post(`${this.apiUrl}/add-employee`, { uid }, { headers })
    );
  }

  /**
   * Remover rol de empleado
   */
  removerRolEmpleado(uid: string): Observable<any> {
    return this.makeAuthenticatedRequest(headers => 
      this.http.post(`${this.apiUrl}/delete-employee`, { uid }, { headers })
    );
  }

  // === OPERACIONES AVANZADAS ===

  /**
   * Revocar tokens de un usuario
   */
  revocarTokens(uid: string): Observable<any> {
    return this.makeAuthenticatedRequest(headers => 
      this.http.post(`${this.apiUrl}/${uid}/revoke-tokens`, {}, { headers })
    );
  }

  /**
   * Cambiar estado del usuario (habilitar/deshabilitar)
   */
  cambiarEstado(uid: string, disabled: boolean): Observable<any> {
    return this.makeAuthenticatedRequest(headers => 
      this.http.patch(`${this.apiUrl}/${uid}/status`, { disabled }, { headers })
    );
  }

  /**
   * Generar custom token
   */
  generarCustomToken(uid: string, additionalClaims: any = {}): Observable<any> {
    return this.makeAuthenticatedRequest(headers => 
      this.http.post(`${this.apiUrl}/${uid}/custom-token`, 
        { additionalClaims }, 
        { headers }
      )
    );
  }

  // === CRUD BÁSICO ===

  /**
   * Crear nuevo administrador (formato legacy y nuevo)
   */
  crearAdmin(emailOrData: string | {email: string, password: string, displayName: string}, password?: string, displayName?: string, token?: string): Observable<any> {
    let userData: {email: string, password: string, displayName: string};
    
    if (typeof emailOrData === 'string') {
      // Formato legacy: crearAdmin(email, password, displayName, token)
      userData = { email: emailOrData, password: password!, displayName: displayName! };
    } else {
      // Formato nuevo: crearAdmin({email, password, displayName})
      userData = emailOrData;
    }

    return this.makeAuthenticatedRequest(headers => 
      this.http.post(`${this.apiUrl}/crear-admin`, userData, { headers })
    );
  }

  /**
   * Actualizar usuario (formato legacy y nuevo)
   */
  actualizarUsuario(uid: string, userData: any, token?: string): Observable<any> {
    return this.makeAuthenticatedRequest(headers => 
      this.http.put(`${this.apiUrl}/${uid}`, userData, { headers })
    );
  }

  /**
   * Eliminar usuario
   */
  eliminarUsuario(uid: string): Observable<any> {
    return this.makeAuthenticatedRequest(headers => 
      this.http.delete(`${this.apiUrl}/${uid}`, { headers })
    );
  }

  // === UTILIDADES ===

  /**
   * Obtener claims actuales del usuario autenticado (delega a AuthService)
   */
  async obtenerClaimsActuales(): Promise<CustomClaims | null> {
    return this.authService.obtenerClaimsActuales();
  }

  /**
   * Verificar si el usuario actual tiene un rol específico (delega a AuthService)
   */
  async tieneRol(rol: 'admin' | 'employee' | 'user'): Promise<boolean> {
    return this.authService.tieneRol(rol);
  }

  /**
   * Obtener estadísticas de usuarios
   */
  obtenerEstadisticas(): Observable<{
    total: number;
    administradores: number;
    empleados: number;
    usuarios: number;
    activos: number;
    deshabilitados: number;
    emailsVerificados: number;
  }> {
    return this.listarUsuarios().pipe(
      map(usuarios => {
        const total = usuarios.length;
        const administradores = usuarios.filter(u => 
          u.customClaims?.role === 'admin' || u.customClaims?.isAdmin
        ).length;
        const empleados = usuarios.filter(u => 
          (u.customClaims?.role === 'employee' || u.customClaims?.isEmployee) && 
          !(u.customClaims?.role === 'admin' || u.customClaims?.isAdmin)
        ).length;
        const usuariosRegulares = total - administradores - empleados;
        const activos = usuarios.filter(u => !u.disabled).length;
        const deshabilitados = total - activos;
        const emailsVerificados = usuarios.filter(u => u.emailVerified).length;

        return {
          total,
          administradores,
          empleados,
          usuarios: usuariosRegulares,
          activos,
          deshabilitados,
          emailsVerificados
        };
      })
    );
  }

  /**
   * Filtrar usuarios por rol
   */
  filtrarPorRol(usuarios: UserProfile[], rol: 'admin' | 'employee' | 'user'): UserProfile[] {
    return usuarios.filter(usuario => {
      const claims = usuario.customClaims;
      if (!claims) return rol === 'user';

      switch (rol) {
        case 'admin':
          return claims.role === 'admin' || claims.isAdmin === true;
        case 'employee':
          return (claims.role === 'employee' || claims.isEmployee === true) && 
                 !(claims.role === 'admin' || claims.isAdmin === true);
        case 'user':
          return !(claims.role === 'admin' || claims.isAdmin) && 
                 !(claims.role === 'employee' || claims.isEmployee);
        default:
          return false;
      }
    });
  }

  /**
   * Obtener nombre del rol en español
   */
  obtenerNombreRol(usuario: UserProfile): string {
    const claims = usuario.customClaims;
    if (!claims) return 'Usuario';

    if (claims.role === 'admin' || claims.isAdmin) return 'Administrador';
    if (claims.role === 'employee' || claims.isEmployee) return 'Empleado';
    return 'Usuario';
  }

  /**
   * Verificar si un usuario está activo
   */
  estaActivo(usuario: UserProfile): boolean {
    return !usuario.disabled;
  }

  // === MÉTODOS DE COMPATIBILIDAD PARA EL COMPONENTE ===

  /**
   * Obtener usuarios (alias para listarUsuarios)
   */
  obtenerUsuarios(): Observable<UserProfile[]> {
    return this.listarUsuarios();
  }

  /**
   * Obtener detalle de usuario (alias para obtenerUsuario)
   */
  obtenerDetalleUsuario(uid: string): Observable<UserProfile> {
    return this.obtenerUsuario(uid);
  }

  /**
   * Revocar tokens de usuario
   */
  revocarTokensUsuario(uid: string): Observable<any> {
    return this.revocarTokens(uid);
  }

  /**
   * Cambiar estado de usuario
   */
  cambiarEstadoUsuario(uid: string, disabled: boolean): Observable<any> {
    return this.cambiarEstado(uid, disabled);
  }

  /**
   * Asignar admin (con token legacy)
   */
  asignarAdmin(uid: string, token: string): Observable<any> {
    return this.asignarRolAdmin(uid);
  }

  /**
   * Remover admin (con token legacy)
   */
  removerAdmin(uid: string, token: string): Observable<any> {
    return this.removerRolAdmin(uid);
  }

  /**
   * Asignar empleado (con token legacy)
   */
  asignarEmpleado(uid: string, token: string): Observable<any> {
    return this.asignarRolEmpleado(uid);
  }

  /**
   * Remover empleado (con token legacy)
   */
  removerEmpleado(uid: string, token: string): Observable<any> {
    return this.removerRolEmpleado(uid);
  }

  /**
   * Crear admin (formato legacy compatible)
   */
  crearAdminLegacy(email: string, password: string, displayName: string, token: string): Observable<any> {
    return this.crearAdmin(email, password, displayName);
  }

  /**
   * Actualizar usuario (formato legacy compatible)
   */
  actualizarUsuarioLegacy(uid: string, userData: any, token: string): Observable<any> {
    return this.actualizarUsuario(uid, userData);
  }

  /**
   * Obtener usuario actual (delega a AuthService)
   */
  getUsuarioActual() {
    return this.authService.getUsuarioActual();
  }

  /**
   * Manejo de errores centralizado
   */
  private handleError = (error: any): Observable<never> => {
    console.error('Error en UserManagementService:', error);
    return throwError(() => error);
  };
}
