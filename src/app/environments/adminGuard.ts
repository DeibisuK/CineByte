import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { AuthService } from '../services/AuthService';

@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate {
    constructor(private authRole: AuthService, private router: Router) { }

    canActivate() {
        return this.authRole.role$.pipe(
            filter(role => role !== null), // Espera hasta que role no sea null
            take(1),                       // Toma solo la primera emisión válida
            map(role => {
                if (role === 'admin') {
                    return true;
                }
                this.router.navigate(['/inicio']);
                return false;
            })
        );
    }
}
