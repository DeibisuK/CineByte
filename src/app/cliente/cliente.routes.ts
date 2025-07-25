import { Routes } from '@angular/router';
import { CarouselPromosComponent } from './features/promotions/pages/carousel-promos/carousel-promos.component';
import { DetallePeliculaComponent } from './features/movies/pages/detalle-pelicula/detalle-pelicula.component';
import { DetallePromocionComponent } from './features/promotions/pages/detalle-promocion/detalle-promocion.component';
import { BuscarComponent } from './features/movies/pages/buscar/buscar.component';
import { ListarSedesComponent } from '../admin/components/sedes/listar-sedes/listar-sedes.component';
import { TerminosYCondicionesComponent } from './features/legal/terminos-y-condiciones/terminos-y-condiciones.component';
import { AcercaDeNosotrosComponent } from './features/legal/acerca-de-nosotros/acerca-de-nosotros.component';
import { PoliticaDePrivacidadComponent } from './features/legal/politica-de-privacidad/politica-de-privacidad.component';
import { InicioComponent } from './features/home/inicio.component';
import { ListarPromocionesComponent } from '@admin/components/promociones/listar-promociones/listar-promociones.component';
import { PerfilComponent } from './features/user-profile/perfil/perfil.component';
import { ListMetodoComponent } from './features/user-profile/metodos-pago/list-metodo/list-metodo.component';
import { CrearMetodoComponent } from './features/user-profile/metodos-pago/crear-metodo/crear-metodo.component';
import { ContactanosComponent } from './features/contact/contactanos.component';
import { CatalogoComponent } from './features/movies/pages/catalogo/catalogo.component';
import { SelectSeatComponent } from './features/shop/select-seat/select-seat.component';
import { DetailPaymentComponent } from './features/shop/detail-payment/detail-payment.component';
import { EndPaymentComponent } from './features/shop/end-payment/end-payment.component';
import { ProximosEstrenosComponent } from './features/movies/pages/proximos-estrenos/proximos-estrenos.component';
import { EnCarteleraComponent } from './features/movies/pages/en-cartelera/en-cartelera.component';
import { PromocionesPageComponent } from './features/promociones/promociones-page.component';


export const clienteRoutes: Routes = [
  {path: '', redirectTo: 'inicio', pathMatch: 'full' },
  {path: 'inicio', component:InicioComponent},
  {path: 'peliculas', component: CatalogoComponent},
  {path: 'promociones', component:PromocionesPageComponent},
  {path: 'todas-las-promociones', component:ListarPromocionesComponent},
  {path: 'carrusel', component:CarouselPromosComponent},
  {path: 'pelicula/:id/:titulo', component: DetallePeliculaComponent},
  {path: 'select-seat', component: SelectSeatComponent},
  {path: 'detail-payment', component: DetailPaymentComponent},
  {path: 'promocion/:id/:titulo', component: DetallePromocionComponent},
  {path: 'buscar/:termino', component: BuscarComponent},
  {path: 'contactanos', component: ContactanosComponent},
  {path: 'perfil', component: PerfilComponent},
  {path: 'donde-estamos', component: ListarSedesComponent},
  {path: 'terminos-y-condiciones', component: TerminosYCondicionesComponent},
  {path: 'acerca-de-nosotros', component: AcercaDeNosotrosComponent},
  {path: 'politica-de-privacidad', component: PoliticaDePrivacidadComponent},
  {path: 'final', component: EndPaymentComponent},
  //Cartelera
  {path: 'peliculas', component: CatalogoComponent},
  {path: 'proximos-estrenos', component: ProximosEstrenosComponent},
  {path: 'en-cartelera', component: EnCarteleraComponent},
  //Metodos de pago
  {path: 'metodos-de-pago', component: ListMetodoComponent},
  {path: 'metodos-de-pago/agregar', component: CrearMetodoComponent},
];
