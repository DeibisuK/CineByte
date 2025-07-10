import { Component } from '@angular/core';
import { CarouselInicialComponent } from '../movies/pages/carousel-inicial/carousel-inicial.component';
import { EnCarteleraComponent } from '../movies/pages/en-cartelera/en-cartelera.component';
import { EventosEspecialesComponent } from '../movies/pages/eventos-especiales/eventos-especiales.component';
import { CarouselPromosComponent } from '../promotions/pages/carousel-promos/carousel-promos.component';
import { ProximosEstrenosComponent } from '../movies/pages/proximos-estrenos/proximos-estrenos.component';

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
