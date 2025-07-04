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
import { ListUsersComponent } from './components/usuarios/list-users/list-users.component';
import { CrearSalasComponent } from './components/salas/crear-salas/crear-salas.component';
import { ListarActoresComponent } from './components/actores/listar-actores/listar-actores.component';
import { CrearActorComponent } from './components/actores/crear-actor/crear-actor.component';
import { CrearDistribuidorComponent } from './components/distribuidor/crear-distribuidor/crear-distribuidor.component';
import { ListDistribuidorComponent } from './components/distribuidor/listar-distribuidor/list-distribuidor.component';
import { ListSalasComponent } from './components/salas/list-salas/list-salas.component';
import { EditSalasComponent } from './components/salas/edit-salas/edit-salas.component';
import { EditarPromocionComponent } from './components/promociones/editar-promociones/editar-promociones.component';
import { ListarFuncionesComponent } from './components/funciones/listar-funciones/listar-funciones.component';
import { EditarFuncionesComponent } from './components/funciones/editar-funciones/editar-funciones.component';
import { CrearFuncionesComponent } from './components/funciones/crear-funciones/crear-funciones.component';
import { AnuncioComponent } from './components/anuncio/anuncio.component';

export const adminRoutes: Routes = [
  {
    path: '', redirectTo: 'dashboard', pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'list-actores',
    component: ListarActoresComponent
  },
  {
    path: 'crear-actores',
    component: CrearActorComponent
  },
  {
    path: 'list-distribuidor',
    component: ListDistribuidorComponent
  },
  {
    path: 'crear-distribuidor',
    component: CrearDistribuidorComponent
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
    path: 'list-promocion',
    component: ListarPromocionesComponent
  },
  {
    path: 'add-promocion',
    component: CreatePromocionComponent
  },
  {
    path: 'edit-promocion/:id',
    component: EditarPromocionComponent
  },
  {
    path: 'list-funcion',
    component: ListarFuncionesComponent
  },
  {
    path: 'edit-funcion/:id',
    component: EditarFuncionesComponent
  },
  {
    path: 'crear-funcion',
    component: CrearFuncionesComponent
  },
  {
    path: 'users',
    component: ListUsersComponent
  },
  {
    path: 'list-sala',
    component: ListSalasComponent
  },
  {
    path: 'add-sala',
    component: CrearSalasComponent
  },
  {
    path: 'edit-sala/:id',
    component: EditSalasComponent
  },
  {
    path: 'anuncio',
    component: AnuncioComponent
  }

];