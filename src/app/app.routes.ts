import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { CliLayoutComponent } from './layout/cli-layout/cli-layout.component';

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
    children: [
      {
        path: '',
        loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes),
      }
    ]
  }
];
