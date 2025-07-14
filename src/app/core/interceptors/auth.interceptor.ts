import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, timer } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { AuthService } from '@core/services/auth/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Verificar el estado del token cada 30 segundos
    this.startTokenValidationTimer();
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si el token fue revocado o es inválido (401/403)
        if (error.status === 401 || error.status === 403) {
          return this.handle401Error(req, next);
        }
        return throwError(error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      // Intentar obtener un nuevo token
      return this.authService.user$.pipe(
        take(1),
        switchMap((user) => {
          if (user) {
            // Forzar la obtención de un nuevo token
            return user.getIdToken(true);
          } else {
            // No hay usuario, cerrar sesión
            this.authService.logout();
            this.router.navigate(['/auth/login']);
            return throwError('No user authenticated');
          }
        }),
        switchMap((token: string) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token);
          
          // Reinttentar la petición original con el nuevo token
          const authReq = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
          
          return next.handle(authReq);
        }),
        catchError((error) => {
          this.isRefreshing = false;
          
          // Si falla la renovación, significa que el token fue revocado
          console.warn('Token revocado o inválido, cerrando sesión...');
          this.authService.logout();
          this.router.navigate(['/auth/login'], {
            queryParams: { message: 'session_expired' }
          });
          
          return throwError(error);
        })
      );
    } else {
      // Esperar a que termine el refresh en curso
      return this.refreshTokenSubject.pipe(
        take(1),
        switchMap((token) => {
          if (token) {
            const authReq = request.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            });
            return next.handle(authReq);
          } else {
            return throwError('Token refresh failed');
          }
        })
      );
    }
  }

  /**
   * Verificar la validez del token cada 30 segundos
   */
  private startTokenValidationTimer() {
    timer(0, 30000).subscribe(() => {
      this.validateCurrentToken();
    });
  }

  private async validateCurrentToken() {
    try {
      const user = this.authService.getUsuarioActual();
      if (user) {
        // Intentar obtener un token fresco
        const token = await user.getIdToken(true);
        
        // Validar el token con el backend
        this.validateTokenWithBackend(token);
      }
    } catch (error) {
      console.warn('Error validando token, posiblemente revocado:', error);
      
      // Si el token falló, cerrar sesión
      this.authService.logout();
      this.router.navigate(['/auth/login'], {
        queryParams: { message: 'session_revoked' }
      });
    }
  }

  /**
   * Opcional: Validar el token con el backend
   */
  private validateTokenWithBackend(token: string) {
    // Hacer una petición al endpoint de validación
    fetch('/api/auth/session-status', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Token validation failed: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (!data.sessionValid) {
        console.warn('Token invalidado por el servidor:', data.reason);
        
        // Token inválido, cerrar sesión
        this.authService.logout();
        this.router.navigate(['/auth/login'], {
          queryParams: { 
            message: 'session_invalidated',
            reason: data.reason 
          }
        });
      }
    })
    .catch((error) => {
      console.warn('Error validando token con backend:', error);
      // En caso de error de red, no cerrar sesión automáticamente
    });
  }
}
