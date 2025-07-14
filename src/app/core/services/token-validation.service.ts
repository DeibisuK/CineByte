import { Injectable } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenValidationService {
  private validationSubscription?: Subscription;
  private isValidating = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Iniciar la validación periódica de tokens
   */
  startValidation() {
    if (this.validationSubscription) {
      return; // Ya está corriendo
    }

    // Validar cada 30 segundos
    this.validationSubscription = interval(30000).subscribe(() => {
      this.validateToken();
    });

    // Validación inicial
    this.validateToken();
  }

  /**
   * Detener la validación periódica
   */
  stopValidation() {
    if (this.validationSubscription) {
      this.validationSubscription.unsubscribe();
      this.validationSubscription = undefined;
    }
  }

  /**
   * Validar el token actual
   */
  private async validateToken() {
    if (this.isValidating) {
      return; // Evitar validaciones múltiples simultáneas
    }

    this.isValidating = true;

    try {
      const user = this.authService.getUsuarioActual();
      
      if (!user) {
        this.isValidating = false;
        return; // No hay usuario logueado
      }

      // Intentar obtener un token fresco
      // Si esto falla, significa que el token fue revocado
      await user.getIdToken(true);
      
      // También verificar que los custom claims estén disponibles
      const tokenResult = await user.getIdTokenResult(true);
      
      // Si llegamos aquí, el token es válido
      console.debug('Token validado correctamente');
      
    } catch (error: any) {
      console.warn('Token inválido o revocado:', error);
      
      // Verificar si es un error de token revocado
      if (this.isTokenRevokedError(error)) {
        this.handleRevokedToken();
      }
    } finally {
      this.isValidating = false;
    }
  }

  /**
   * Verificar si el error indica que el token fue revocado
   */
  private isTokenRevokedError(error: any): boolean {
    const errorCode = error?.code || '';
    const errorMessage = error?.message || '';
    
    return (
      errorCode === 'auth/id-token-revoked' ||
      errorCode === 'auth/user-token-expired' ||
      errorCode === 'auth/user-disabled' ||
      errorMessage.includes('revoked') ||
      errorMessage.includes('expired')
    );
  }

  /**
   * Manejar cuando el token ha sido revocado
   */
  private handleRevokedToken() {
    console.warn('🔒 Token revocado detectado - Cerrando sesión...');
    
    // Mostrar mensaje al usuario
    this.showTokenRevokedMessage();
    
    // Cerrar sesión y redirigir
    this.authService.logout().then(() => {
      this.router.navigate(['/auth/login'], {
        queryParams: { 
          message: 'session_revoked',
          reason: 'Token revocado por administrador'
        }
      });
    });
  }

  /**
   * Mostrar mensaje informativo al usuario
   */
  private showTokenRevokedMessage() {
    // Puedes usar tu servicio de alertas aquí
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        alert('Tu sesión ha sido revocada por un administrador. Serás redirigido al login.');
      }, 100);
    }
  }

  /**
   * Forzar validación inmediata
   */
  async forceValidation(): Promise<boolean> {
    try {
      await this.validateToken();
      return true;
    } catch (error) {
      return false;
    }
  }
}
