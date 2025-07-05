import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CrearPeliculaComponent } from './components/peliculas/crear-pelicula/crear-pelicula.component';
import { ListarPeliculaComponent } from './components/peliculas/listar-pelicula/listar-pelicula.component';
import { CategoriasComponent } from './components/categorias/categorias/categorias.component';
import { ListarSedesComponent } from './components/sedes/listar-sedes/listar-sedes.component';
import { ListarPromocionesComponent } from './components/promociones/listar-promociones/listar-promociones.component';
import { CrearSedesComponent } from './components/sedes/crear-sedes/crear-sedes.component';
import { EditarSedesComponent } from './components/sedes/editar-sedes/editar-sedes.component';
import { AsignSalasComponent } from './components/sedes/asign-salas/asign-salas.component';
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
import { ExportarComponent } from './components/exportar/exportar.component';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'peliculas',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./components/peliculas/peliculas.routes').then(
            (m) => m.peliculasRoutes
          ),
      },
    ],
  },
  {
    path: 'actores',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./components/actores/actores.routes').then(
            (m) => m.actoresRoutes
          ),
      },
    ],
  },
  {
    path: 'distribuidores',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./components/distribuidor/distribuidores.routes').then(
            (m) => m.distribuidoresRoutes
          ),
      },
    ],
  },
  {
    path: 'categorias',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./components/categorias/categorias.routes').then(
            (m) => m.categoriasRoutes
          ),
      },
    ],
  },
  {
    path: 'promociones',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./components/promociones/promociones.routes').then(
            (m) => m.promocionesRoutes
          ),
      },
    ],
  },
  {
    path: 'salas',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./components/salas/salas.routes').then((m) => m.salasRoutes),
      },
    ],
  },
  {
    path: 'funciones',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./components/funciones/funciones.routes').then(
            (m) => m.funcionesRoutes
          ),
      },
    ],
  },
  {
    path: 'sedes',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./components/sedes/sedes.routes').then((m) => m.sedesRoutes),
      },
    ],
  },
  {
    path: 'usuarios',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./components/usuarios/users.routes').then(
            (m) => m.usersRoutes
          ),
      },
    ],
  },
  {
    path: 'exportar',
    component: ExportarComponent,
  },
  {
    path: 'anuncios',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./components/anuncio/anuncios.routes').then(
            (m) => m.anunciosRoutes
          ),
      },
    ],
  },
];
