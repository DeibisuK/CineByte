import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CrearPeliculaComponent } from './peliculas/crear-pelicula/crear-pelicula.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent
    // Aquí puedes agregar más rutas hijas si lo deseas
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'crear-pelicula',
    component: CrearPeliculaComponent
  }
];