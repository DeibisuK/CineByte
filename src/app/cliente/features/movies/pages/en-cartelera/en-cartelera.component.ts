import { Component } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { MovieNavigationService } from '../../services/navigation.service';
import { Movie } from '../../../../../core/models/movie.model';
import { EdadesComponent } from '../../../../../shared/components/edades/edades.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-en-cartelera',
  imports: [CommonModule,EdadesComponent],
  templateUrl: './en-cartelera.component.html',
  styleUrl: './en-cartelera.component.css'
})
export class EnCarteleraComponent {
  peliculasCartelera: Movie[] = [];
  hoveredIndex: number = -1;

    constructor(
    private peliculasService: MovieService,
    private movieNav: MovieNavigationService
  ) {}

  ngOnInit(): void {
    this.peliculasCartelera = this.peliculasService.getMoviesByType('cartelera');
  }

  verDetalle(movie: Movie) {
    this.movieNav.verDetalle(movie);
  }


}
