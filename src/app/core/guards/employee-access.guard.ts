import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmployeeAccessGuard implements CanActivate {
  
  // Rutas permitidas para empleados (solo lectura)
  private readonly EMPLOYEE_ALLOWED_ROUTES = [
    '/admin/peliculas',
    '/admin/actores',
    '/admin/distribuidores',
    '/admin/categorias',
    '/admin/generos',
    '/admin/idiomas',
    '/admin/etiquetas',
    '/admin/funciones',
    '/admin/promociones',
    '/admin/anuncios'
  ];

  // Rutas PROHIBIDAS para empleados
  private readonly EMPLOYEE_FORBIDDEN_ROUTES = [
    '/admin/dashboard',
    '/admin/usuarios',
    '/admin/sedes',
    '/admin/salas',
    '/admin/cines'
  ];

  // Ruta por defecto para empleados
  private readonly EMPLOYEE_DEFAULT_ROUTE = '/admin/peliculas/list';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.role$.pipe(
      take(1),
      map(role => {
        const currentUrl = state.url;
        
        // Si es admin, puede acceder a todo
        if (role === 'admin') {
          return true;
        }

        // Si es empleado, verificar restricciones
        if (role === 'empleado') {
          // Verificar si intenta acceder a rutas prohibidas
          const isForbidden = this.EMPLOYEE_FORBIDDEN_ROUTES.some(forbiddenRoute => 
            currentUrl.startsWith(forbiddenRoute)
          );
          
          if (isForbidden) {
            this.router.navigate([this.EMPLOYEE_DEFAULT_ROUTE]);
            return false;
          }

          // Si intenta acceder a /admin sin especificar ruta, redirigir a películas
          if (currentUrl === '/admin' || currentUrl === '/admin/') {
            this.router.navigate([this.EMPLOYEE_DEFAULT_ROUTE]);
            return false;
          }

          // Verificar si la ruta está en las permitidas
          const isAllowed = this.EMPLOYEE_ALLOWED_ROUTES.some(allowedRoute => 
            currentUrl.startsWith(allowedRoute)
          );
          
          if (!isAllowed) {
            this.router.navigate([this.EMPLOYEE_DEFAULT_ROUTE]);
            return false;
          }
          
          return true;
        }

        // Si no es admin ni empleado, redirigir al inicio
        this.router.navigate(['/']);
        return false;
      })
    );
  }
}
