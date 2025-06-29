import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CrearPeliculaComponent } from './components/peliculas/crear-pelicula/crear-pelicula.component';
import { ListarPeliculaComponent } from './components/peliculas/listar-pelicula/listar-pelicula.component';
import { CategoriasComponent } from './components/categorias/categorias/categorias.component';
import { ListarSedesComponent } from './components/sedes/listar-sedes/listar-sedes.component';
import { ListarPromocionesComponent } from './components/promociones/listar-promociones/listar-promociones.component';
import { CrearSedesComponent } from './components/sedes/crear-sedes/crear-sedes.component';
import { EditarSedesComponent } from './components/sedes/editar-sedes/editar-sedes.component';
import { CreatePromocionComponent } from './components/promociones/crear-promociones/crear-promociones.component';

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
  },
  {
    path: 'promociones',
    component: ListarPromocionesComponent
  },
  {
    path: 'sedes',
    component: ListarSedesComponent
  },
  {
    path: 'add-sede',
    component: CrearSedesComponent
  },
  {
    path: 'edit-sede/:id',
    component: EditarSedesComponent
  },
  {
    path: 'promociones',
    component: ListarPromocionesComponent
  },
  {
    path: 'add-promocion',
    component: CreatePromocionComponent
  }
];