import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of, from } from 'rxjs';
import { map, catchError, take, switchMap } from 'rxjs/operators';
import { AuthService } from '@core/services/auth/auth.service';
import { UserManagementService } from '@core/services/user-management.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.user$.pipe(
      take(1),
      map(user => {
        if (user) {
          return true;
        } else {
          // Solo redirigir si estamos seguros de que no hay usuario
          // Dar tiempo para que Firebase cargue completamente
          setTimeout(() => {
            this.router.navigate(['/auth/login'], { 
              queryParams: { returnUrl: state.url } 
            });
          }, 100);
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(['/auth/login']);
        return of(false);
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private userManagementService: UserManagementService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.user$.pipe(
      take(1),
      switchMap(async (user) => {
        if (!user) {
          this.router.navigate(['/auth/login'], { 
            queryParams: { returnUrl: state.url } 
          });
          return false;
        }

        try {
          const isAdmin = await this.userManagementService.tieneRol('admin');
          if (isAdmin) {
            return true;
          } else {
            this.router.navigate(['/dashboard'], {
              queryParams: { error: 'admin_required' }
            });
            return false;
          }
        } catch (error) {
          console.error('Error verificando rol admin:', error);
          // No redirigir inmediatamente en caso de error de red
          // Permitir acceso y que el componente maneje el error
          return true;
        }
      }),
      catchError((error) => {
        console.error('Error en AdminGuard:', error);
        return of(true); // Permitir acceso en caso de error para evitar bucles
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private userManagementService: UserManagementService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.user$.pipe(
      take(1),
      switchMap(async (user) => {
        if (!user) {
          this.router.navigate(['/auth/login'], { 
            queryParams: { returnUrl: state.url } 
          });
          return false;
        }

        try {
          const isAdmin = await this.userManagementService.tieneRol('admin');
          const isEmployee = await this.userManagementService.tieneRol('employee');
          
          if (isAdmin || isEmployee) {
            return true;
          } else {
            this.router.navigate(['/dashboard'], {
              queryParams: { error: 'employee_required' }
            });
            return false;
          }
        } catch (error) {
          console.error('Error en EmployeeGuard:', error);
          return true; // Permitir acceso en caso de error
        }
      }),
      catchError((error) => {
        console.error('Error en EmployeeGuard:', error);
        return of(true);
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private userManagementService: UserManagementService,
    private router: Router
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    try {
      const user = this.authService.getUsuarioActual();
      if (!user) {
        this.router.navigate(['/auth/login'], { 
          queryParams: { returnUrl: state.url } 
        });
        return false;
      }

      // Obtener roles requeridos desde los datos de la ruta
      const requiredRoles = route.data['roles'] as string[];
      
      if (!requiredRoles || requiredRoles.length === 0) {
        return true; // Si no se especifican roles, permitir acceso
      }

      // Verificar si el usuario tiene alguno de los roles requeridos
      for (const role of requiredRoles) {
        const hasRole = await this.userManagementService.tieneRol(role as any);
        if (hasRole) {
          return true;
        }
      }

      // Si no tiene ningún rol requerido, denegar acceso
      this.router.navigate(['/dashboard'], {
        queryParams: { 
          error: 'insufficient_permissions',
          required: requiredRoles.join(',')
        }
      });
      return false;
    } catch (error) {
      console.error('Error en RoleGuard:', error);
      this.router.navigate(['/auth/login']);
      return false;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(
    private userManagementService: UserManagementService,
    private router: Router
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    try {
      // Obtener permisos requeridos desde los datos de la ruta
      const requiredPermissions = route.data['permissions'] as string[];
      
      if (!requiredPermissions || requiredPermissions.length === 0) {
        return true;
      }

      const claims = await this.userManagementService.obtenerClaimsActuales();
      if (!claims) {
        this.router.navigate(['/auth/login']);
        return false;
      }

      // Verificar permisos específicos
      for (const permission of requiredPermissions) {
        if (!this.hasPermission(claims, permission)) {
          this.router.navigate(['/dashboard'], {
            queryParams: { error: 'permission_denied', permission }
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error en PermissionGuard:', error);
      this.router.navigate(['/auth/login']);
      return false;
    }
  }

  private hasPermission(claims: any, permission: string): boolean {
    switch (permission) {
      case 'manage_users':
        return claims.isAdmin;
      case 'manage_content':
        return claims.isAdmin || claims.isEmployee;
      case 'view_analytics':
        return claims.isAdmin;
      default:
        return false;
    }
  }
}

/* 
EJEMPLO DE USO EN RUTAS:

const routes: Routes = [
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'users',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
    component: UsersComponent
  },
  {
    path: 'content',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'employee'] },
    component: ContentComponent
  },
  {
    path: 'analytics',
    canActivate: [AuthGuard, PermissionGuard],
    data: { permissions: ['view_analytics'] },
    component: AnalyticsComponent
  }
];
*/
