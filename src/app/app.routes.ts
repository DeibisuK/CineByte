import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./cliente/cliente.routes').then(m => m.clienteRoutes)
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes)
      }
    ]
  }
];
