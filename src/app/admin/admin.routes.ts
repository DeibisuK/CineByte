import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CrearPeliculaComponent } from './components/peliculas/crear-pelicula/crear-pelicula.component';
import { ListarPeliculaComponent } from './components/peliculas/listar-pelicula/listar-pelicula.component';

export const adminRoutes: Routes = [
  
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'peliculas',
    component: CrearPeliculaComponent
  },
  {
    path: 'listar-peliculas',
    component: ListarPeliculaComponent
  }
];