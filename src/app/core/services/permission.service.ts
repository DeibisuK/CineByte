import { Injectable } from '@angular/core';
import { AuthService } from './auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  
  constructor(private authService: AuthService) {}

  /**
   * Verifica si el usuario actual puede crear/editar/eliminar registros
   */
  canModifyData(): boolean {
    const role = this.authService.getRole();
    return role === 'admin'; // Solo admins pueden modificar datos
  }

  /**
   * Verifica si el usuario puede ver datos (lectura)
   */
  canReadData(): boolean {
    const role = this.authService.getRole();
    return role === 'admin' || role === 'empleado'; // Ambos pueden ver datos
  }

  /**
   * Verifica si el usuario puede gestionar usuarios
   */
  canManageUsers(): boolean {
    const role = this.authService.getRole();
    return role === 'admin'; // Solo admins pueden gestionar usuarios
  }

  /**
   * Verifica si el usuario puede exportar datos
   */
  canExportData(): boolean {
    const role = this.authService.getRole();
    return role === 'admin' || role === 'empleado'; // Ambos pueden exportar
  }

  /**
   * Verifica si el usuario puede acceder a estadísticas avanzadas
   */
  canAccessAdvancedStats(): boolean {
    const role = this.authService.getRole();
    return role === 'admin'; // Solo admins pueden ver estadísticas avanzadas
  }

  /**
   * Obtiene el rol actual del usuario
   */
  getCurrentRole(): string | null {
    return this.authService.getRole();
  }

  /**
   * Verifica si es admin
   */
  isAdmin(): boolean {
    return this.authService.getRole() === 'admin';
  }

  /**
   * Verifica si es empleado
   */
  isEmployee(): boolean {
    return this.authService.getRole() === 'empleado';
  }

  /**
   * Verifica si tiene acceso administrativo (admin o empleado)
   */
  hasAdminAccess(): boolean {
    const role = this.authService.getRole();
    return role === 'admin' || role === 'empleado';
  }
}
