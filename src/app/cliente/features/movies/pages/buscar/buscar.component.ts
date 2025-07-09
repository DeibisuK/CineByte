import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Movie } from '../../../../../core/models/movie.model';
import { MovieService } from '../../services/movie.service';
import { MovieNavigationService } from '../../services/navigation.service';
import { CommonModule } from '@angular/common';
import { EdadesComponent } from '../../../../../shared/components/edades/edades.component';
import { Pelicula } from '../../../../../admin/models/pelicula.model';
import { PeliculaService } from '../../../../../services/pelicula.service';

@Component({
  selector: 'app-buscar',
  imports: [CommonModule,EdadesComponent],
  templateUrl: './buscar.component.html',
  styleUrl: './buscar.component.css'
})
export class BuscarComponent implements OnInit{
  termino: string = '';
  resultados: Pelicula[] = [];
  hoveredIndex: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private movieService: PeliculaService,
    private movieNav: MovieNavigationService // Inyecta el servicio global
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.termino = params['termino']?.toLowerCase() || '';
      this.movieService.getPeliculasCompletas().subscribe(movies => {
        this.resultados = movies.filter((p: Pelicula) =>
          p.titulo.toLowerCase().includes(this.termino)
        );
      });
    });
  }

  verDetalle(pelicula: Pelicula) {
    this.movieNav.verDetalle(pelicula); // Usa el método global
  }

   /**
   * Convierte un array de números o strings a un array de strings
   * @param arr Array de números o strings
   * @returns Array de strings
   */
  toStringArray(arr: number[] | string[]): string[] {
    return arr.map(x => x.toString());
  }
}
