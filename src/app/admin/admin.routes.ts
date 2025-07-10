import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
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
