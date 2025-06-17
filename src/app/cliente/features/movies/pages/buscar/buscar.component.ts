import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Movie } from '../../../../../core/models/movie.model';
import { MovieService } from '../../services/movie.service';
import { MovieNavigationService } from '../../services/navigation.service';
import { CommonModule } from '@angular/common';
import { EdadesComponent } from '../../../../../shared/components/edades/edades.component';

@Component({
  selector: 'app-buscar',
  imports: [CommonModule,EdadesComponent],
  templateUrl: './buscar.component.html',
  styleUrl: './buscar.component.css'
})
export class BuscarComponent implements OnInit{
  termino: string = '';
  resultados: Movie[] = [];
  hoveredIndex: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private movieNav: MovieNavigationService // Inyecta el servicio global
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.termino = params['termino']?.toLowerCase() || '';
      this.movieService.getAllMovies().subscribe(movies => {
        this.resultados = movies.filter(p =>
          p.titulo.toLowerCase().includes(this.termino)
        );
      });
    });
  }

  verDetalle(pelicula: Movie) {
    this.movieNav.verDetalle(pelicula); // Usa el método global
  }
}
