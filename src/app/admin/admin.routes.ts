import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CrearPeliculaComponent } from './components/peliculas/crear-pelicula/crear-pelicula.component';
import { ListarPeliculaComponent } from './components/peliculas/listar-pelicula/listar-pelicula.component';
import { CategoriasComponent } from './components/categorias/categorias/categorias.component';

export const adminRoutes: Routes = [
  
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'add-pelicula',
    component: CrearPeliculaComponent
  },
  {
    path: 'list-peliculas',
    component: ListarPeliculaComponent
  },
  {
    path: 'categorias',
    component: CategoriasComponent
  }
];