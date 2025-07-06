import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio.component';
import { PromocionesComponent } from './pages/promociones/promociones.component';
import { CarouselPromosComponent } from './features/promotions/pages/carousel-promos/carousel-promos.component';
import { PeliculasComponent } from './pages/peliculas/peliculas.component';
import { DetallePeliculaComponent } from './features/movies/pages/detalle-pelicula/detalle-pelicula.component';
import { DetallePromocionComponent } from './features/promotions/pages/detalle-promocion/detalle-promocion.component';
import { BuscarComponent } from './features/movies/pages/buscar/buscar.component';
import { ContactanosComponent } from './pages/contactanos/contactanos.component';
import { ListarSedesComponent } from '../admin/components/sedes/listar-sedes/listar-sedes.component';
import { TerminosYCondicionesComponent } from './features/legal/terminos-y-condiciones/terminos-y-condiciones.component';
import { AcercaDeNosotrosComponent } from './features/legal/acerca-de-nosotros/acerca-de-nosotros.component';
import { PoliticaDePrivacidadComponent } from './features/legal/politica-de-privacidad/politica-de-privacidad.component';
import { CatalogoComponent } from './features/movies/pages/catalogo/catalogo.component';
import { PerfilComponent } from './pages/menu-usuario/perfil/perfil.component';
import { ListMetodoComponent } from './pages/menu-usuario/metodos-pago/list-metodo/list-metodo.component';
import { CrearMetodoComponent } from './pages/menu-usuario/metodos-pago/crear-metodo/crear-metodo.component';
import { DetalleMetodoComponent } from './pages/menu-usuario/metodos-pago/detalle-metodo/detalle-metodo.component';


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
  {path: 'donde-estamos', component: ListarSedesComponent},
  {path: 'terminos-y-condiciones', component: TerminosYCondicionesComponent},
  {path: 'acerca-de-nosotros', component: AcercaDeNosotrosComponent},
  {path: 'politica-de-privacidad', component: PoliticaDePrivacidadComponent},
  //Metodos de pago
  {path: 'metodos-de-pago', component: ListMetodoComponent},
  {path: 'metodos-de-pago/:id', component: DetalleMetodoComponent},
  {path: 'metodos-de-pago/agregar', component: CrearMetodoComponent},
];
