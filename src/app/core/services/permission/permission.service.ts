import { Injectable } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { Observable, map } from 'rxjs';

export interface Permission {
  canViewDashboard: boolean;
  canViewMovies: boolean;
  canViewCategories: boolean;
  canViewActors: boolean;
  canViewDistributors: boolean;
  canViewFunctions: boolean;
  canViewPromotions: boolean;
  canViewAnnouncements: boolean;
  canViewCinemas: boolean;
  canViewVenues: boolean;
  canViewRooms: boolean;
  canViewUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canCreateAdmins: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private authService: AuthService) { }

  getPermissions(): Observable<Permission> {
    return this.authService.role$.pipe(
      map(role => {
        const isAdmin = role === 'admin';
        const isEmployee = role === 'employee' || role === 'empleado'; // Compatibilidad con el valor anterior
        
        return {
          // Solo para admins
          canViewDashboard: isAdmin,
          canViewCinemas: isAdmin,
          canViewVenues: isAdmin,
          canViewRooms: isAdmin,
          canViewUsers: isAdmin,
          canEditUsers: isAdmin,
          canDeleteUsers: isAdmin,
          canCreateAdmins: isAdmin,
          
          // Permisos para empleados y admins
          canViewMovies: isAdmin || isEmployee,
          canViewCategories: isAdmin || isEmployee,
          canViewActors: isAdmin || isEmployee,
          canViewDistributors: isAdmin || isEmployee,
          canViewFunctions: isAdmin || isEmployee,
          canViewPromotions: isAdmin || isEmployee,
          canViewAnnouncements: isAdmin || isEmployee
        };
      })
    );
  }

  canViewDashboard(): Observable<boolean> {
    return this.getPermissions().pipe(map(p => p.canViewDashboard));
  }

  canViewMovies(): Observable<boolean> {
    return this.getPermissions().pipe(map(p => p.canViewMovies));
  }

  canViewCategories(): Observable<boolean> {
    return this.getPermissions().pipe(map(p => p.canViewCategories));
  }

  canViewActors(): Observable<boolean> {
    return this.getPermissions().pipe(map(p => p.canViewActors));
  }

  canViewDistributors(): Observable<boolean> {
    return this.getPermissions().pipe(map(p => p.canViewDistributors));
  }

  canViewFunctions(): Observable<boolean> {
    return this.getPermissions().pipe(map(p => p.canViewFunctions));
  }

  canViewPromotions(): Observable<boolean> {
    return this.getPermissions().pipe(map(p => p.canViewPromotions));
  }

  canViewAnnouncements(): Observable<boolean> {
    return this.getPermissions().pipe(map(p => p.canViewAnnouncements));
  }

  canViewCinemas(): Observable<boolean> {
    return this.getPermissions().pipe(map(p => p.canViewCinemas));
  }

  canViewVenues(): Observable<boolean> {
    return this.getPermissions().pipe(map(p => p.canViewVenues));
  }

  canViewRooms(): Observable<boolean> {
    return this.getPermissions().pipe(map(p => p.canViewRooms));
  }

  canViewUsers(): Observable<boolean> {
    return this.getPermissions().pipe(map(p => p.canViewUsers));
  }

  canEditUsers(): Observable<boolean> {
    return this.getPermissions().pipe(map(p => p.canEditUsers));
  }

  canDeleteUsers(): Observable<boolean> {
    return this.getPermissions().pipe(map(p => p.canDeleteUsers));
  }

  canCreateAdmins(): Observable<boolean> {
    return this.getPermissions().pipe(map(p => p.canCreateAdmins));
  }
}
