import { Component } from '@angular/core';
import { CatalogoComponent } from '../../features/movies/pages/catalogo/catalogo.component';

@Component({
  selector: 'app-peliculas',
  imports: [CatalogoComponent],
  templateUrl: './peliculas.component.html',
  styleUrl: './peliculas.component.css'
})
export class PeliculasComponent {

}
