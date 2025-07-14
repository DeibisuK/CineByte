import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { CliLayoutComponent } from './layout/cli-layout/cli-layout.component';
import { AdminGuard, EmployeeGuard } from './core/guards/auth.guards';
import { EmployeeAccessGuard } from './core/guards/employee-access.guard';

export const routes: Routes = [
  {
    path: '',
    component: CliLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./cliente/cliente.routes').then(m => m.clienteRoutes)
      }
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [EmployeeGuard, EmployeeAccessGuard],   // Permite admin y empleados, pero con restricciones
    children: [
      {
        path: '',
        loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes),
      }
    ]
  },
  {
    path: '**', redirectTo: 'inicio'
  }
];
