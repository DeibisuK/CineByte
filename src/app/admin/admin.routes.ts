import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CrearPeliculaComponent } from './peliculas/crear-pelicula/crear-pelicula.component';

export const adminRoutes: Routes = [
  
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'peliculas',
    component: CrearPeliculaComponent
  }
];