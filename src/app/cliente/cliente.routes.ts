import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio.component';
import { PromocionesComponent } from './pages/promociones/promociones.component';
import { CarouselPromosComponent } from './features/promotions/pages/carousel-promos/carousel-promos.component';
import { PeliculasComponent } from './pages/peliculas/peliculas.component';
import { DetallePeliculaComponent } from './features/movies/pages/detalle-pelicula/detalle-pelicula.component';
import { DetallePromocionComponent } from './features/promotions/pages/detalle-promocion/detalle-promocion.component';
import { BuscarComponent } from './features/movies/pages/buscar/buscar.component';
import { ContactanosComponent } from './pages/contactanos/contactanos.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { ListarSedesComponent } from '../admin/components/sedes/listar-sedes/listar-sedes.component';


export const clienteRoutes: Routes = [
  {path: '', redirectTo: 'inicio', pathMatch: 'full' },
  {path: 'inicio', component:InicioComponent},
  {path: 'promociones', component:PromocionesComponent},
  {path: 'carrusel', component:CarouselPromosComponent},
  {path: 'peliculas', component: PeliculasComponent},
  {path: 'pelicula/:id/:titulo', component: DetallePeliculaComponent},
  {path: 'promocion/:id/:titulo', component: DetallePromocionComponent},
  {path: 'buscar/:termino', component: BuscarComponent},
  {path: 'contactanos', component: ContactanosComponent},
  {path: 'perfil', component: PerfilComponent},
  {path: 'donde-estamos', component: ListarSedesComponent}
];
