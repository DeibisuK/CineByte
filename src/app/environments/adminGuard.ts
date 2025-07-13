import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from '@core/services';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
    constructor(private authRole: AuthService, private router: Router) {}

    canActivate(): Observable<boolean> {
        return this.authRole.user$.pipe(
            take(1),
            switchMap(user => {
                if (!user) {
                    this.router.navigate(['/inicio']);
                    return of(false);
                }
                return this.authRole.role$.pipe(
                    filter(role => role !== null),
                    take(1),
                    map(role => {
                        if (role === 'admin' || role === 'empleado') {
                            return true; // Permite acceso, EmployeeAccessGuard manejará las restricciones específicas
                        }
                        this.router.navigate(['/inicio']);
                        return false;
                    })
                );
            })
        );
    }
}
