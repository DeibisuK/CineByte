import { Component } from '@angular/core';
import { MovieNavigationService } from '../../services/navigation.service';
import { EdadesComponent } from '../../../../../shared/components/edades/edades.component';
import { CommonModule } from '@angular/common';
import { Pelicula } from '../../../../../admin/models/pelicula.model';
import { PeliculaService } from '../../../../../services/pelicula.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-en-cartelera',
  imports: [CommonModule, EdadesComponent],
  templateUrl: './en-cartelera.component.html',
  styleUrl: './en-cartelera.component.css'
})
export class EnCarteleraComponent {
  peliculasCartelera: Pelicula[] = [];
  hoveredIndex: number = -1;

  constructor(
    private peliculasService: PeliculaService,
    private movieNav: MovieNavigationService
  ) { }

  ngOnInit(): void {
    this.peliculasService.getPeliculasCompletas().subscribe({
      next: (peliculas: Pelicula[]) => {
        // Verificar qué películas tienen funciones
        this.verificarPeliculasConFunciones(peliculas);
      },
      error: (err) => {
        console.error('Error fetching películas:', err);
      }
    });
  }

  private verificarPeliculasConFunciones(peliculas: Pelicula[]): void {
    // Crear un array de observables para verificar funciones de cada película
    const funcionesObservables = peliculas.map(pelicula => 
      this.peliculasService.getFuncionesByPeliculaId(pelicula.id_pelicula).pipe(
        map(response => {
          // Verificar si la película tiene funciones
          const funcionesData = response[0]?.obtener_funciones_por_id_pelicula_formato_json || [];
          return {
            pelicula: pelicula,
            tieneFunciones: funcionesData.length > 0
          };
        }),
        catchError(err => {
          console.error(`Error fetching funciones for película ${pelicula.id_pelicula}:`, err);
          return of({
            pelicula: pelicula,
            tieneFunciones: false
          });
        })
      )
    );

    // Ejecutar todas las consultas en paralelo
    forkJoin(funcionesObservables).subscribe({
      next: (resultados) => {
        // Filtrar solo las películas que tienen funciones
        this.peliculasCartelera = resultados
          .filter(resultado => resultado.tieneFunciones)
          .map(resultado => resultado.pelicula);
      },
      error: (err) => {
        console.error('Error verificando funciones:', err);
        // En caso de error, mostrar todas las películas
        this.peliculasCartelera = peliculas;
      }
    });
  }

  verDetalle(movie: Pelicula) {
    this.movieNav.verDetalle(movie);
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
