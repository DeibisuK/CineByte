import { Component } from '@angular/core';
import { CarouselInicialComponent } from '../../features/movies/pages/carousel-inicial/carousel-inicial.component';
import { EnCarteleraComponent } from '../../features/movies/pages/en-cartelera/en-cartelera.component';
import { EventosEspecialesComponent } from '../../features/movies/pages/eventos-especiales/eventos-especiales.component';
import { CarouselPromosComponent } from '../../features/promotions/pages/carousel-promos/carousel-promos.component';
import { ProximosEstrenosComponent } from '../../features/movies/pages/proximos-estrenos/proximos-estrenos.component';

@Component({
  selector: 'app-inicio',
  imports: [CarouselInicialComponent,
    EnCarteleraComponent,
    EventosEspecialesComponent,
    CarouselPromosComponent,
    ProximosEstrenosComponent
  ],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {

}
