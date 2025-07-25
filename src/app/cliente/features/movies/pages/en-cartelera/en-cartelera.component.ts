import { Component } from '@angular/core';
import { MovieNavigationService } from '../../services/navigation.service';
import { EdadesComponent } from '../../../../../shared/components/edades/edades.component';
import { CommonModule } from '@angular/common';
import { Pelicula } from '@core/models/pelicula.model';
import { Funciones } from '@core/models/funciones.model';
import { PeliculaService } from '@features/movies/services/pelicula.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-en-cartelera',
  imports: [CommonModule, EdadesComponent],
  templateUrl: './en-cartelera.component.html',
  styleUrl: './en-cartelera.component.css'
})
export class EnCarteleraComponent {
  peliculasCartelera: Pelicula[] = [];
  hoveredIndex: number = -1;
  loading: boolean = true; // Agregar loading

  constructor(
    private peliculasService: PeliculaService,
    private movieNav: MovieNavigationService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.peliculasService.getPeliculasCompletas().subscribe({
      next: (peliculas: Pelicula[]) => {
        // Verificar qué películas tienen funciones con manejo robusto de errores
        this.verificarPeliculasConFunciones(peliculas);
      },
      error: () => {
        this.loading = false;
      }
    });

    setInterval(() => {
      this.verificarYActualizarEstadoFunciones();
    }, 60000);
  }

  private verificarPeliculasConFunciones(peliculas: Pelicula[]): void {
    // Filtrar primero por estado para reducir llamadas
    const peliculasCandidatas = peliculas.filter(pelicula =>
      pelicula.estado === 'activo');

    if (peliculasCandidatas.length === 0) {
      this.peliculasCartelera = [];
      return;
    }

    // Crear un timeout de 10 segundos para evitar esperas largas
    const timeoutDuration = 10000;

    // Crear un array de observables para verificar funciones de cada película
    const funcionesObservables = peliculasCandidatas.map(pelicula =>
      this.peliculasService.getFuncionesByPeliculaId(pelicula.id_pelicula).pipe(
        timeout(timeoutDuration),
        map(response => {
          // Verificar si la película tiene funciones activas
          const funcionesData = response || [];
          const funcionesVerificadas = this.verificarEstadoFuncionesPorFecha(funcionesData);
          const funcionesActivas = funcionesVerificadas.filter((funcion: Funciones) => funcion.estado === 'activa');
          return {
            pelicula: pelicula,
            tieneFunciones: funcionesActivas.length > 0
          };
        }),
        catchError(() => {
          // En caso de cualquier error, asumir que no tiene funciones para ser conservadores
          return of({
            pelicula: pelicula,
            tieneFunciones: false
          });
        })
      )
    );

    // Ejecutar todas las consultas en paralelo con timeout global
    const funcionesCheck = forkJoin(funcionesObservables).pipe(
      timeout(timeoutDuration + 2000), // Un poco más de tiempo para el forkJoin
      catchError(() => {
        // En caso de timeout, retornar todas las películas candidatas como si tuvieran funciones
        return of(peliculasCandidatas.map(pelicula => ({
          pelicula: pelicula,
          tieneFunciones: true
        })));
      })
    );

    funcionesCheck.subscribe({
      next: (resultados) => {
        // Filtrar solo las películas que tienen funciones
        this.peliculasCartelera = resultados
          .filter(resultado => resultado.tieneFunciones)
          .map(resultado => resultado.pelicula);
        this.loading = false; // Terminar loading
      },
      error: () => {
        // En caso de error, mostrar todas las películas candidatas
        this.peliculasCartelera = peliculasCandidatas;
        this.loading = false; // Terminar loading
      }
    });
  }
  verDetalle(movie: Pelicula) {
    this.movieNav.verDetalle(movie);
  }

  /**
   * Verifica y actualiza el estado de las funciones basado en fecha y hora actual
  */
  private verificarEstadoFuncionesPorFecha(funciones: Funciones[]): Funciones[] {
    const ahora = new Date();

    return funciones.map(funcion => {
      // Crear objeto Date directamente con la fecha que ya contiene fecha y hora
      const fechaHoraFuncion = new Date(funcion.fecha_hora_inicio);
      // Si la fecha/hora de la función ya pasó, marcar como finalizada
      if (fechaHoraFuncion <= ahora && funcion.estado === 'activa') {
        // Actualizar en base de datos
        this.actualizarEstadoFuncion(funcion.id_funcion, 'finalizada');
        return { ...funcion, estado: 'finalizada' };
      }

      return funcion;
    });
  }

  private verificarYActualizarEstadoFunciones(): void {
    this.peliculasCartelera.forEach(pelicula => {
      this.peliculasService.getFuncionesByPeliculaId(pelicula.id_pelicula).subscribe({
        next: (funciones) => {
          this.verificarEstadoFuncionesPorFecha(funciones);
        },
        error: () => {
        }
      });
    });
  }

  /**
   * Actualiza el estado de una función en la base de datos
   */
  private actualizarEstadoFuncion(idFuncion: number, nuevoEstado: string): void {
    this.peliculasService.actualizarEstadoFuncion(idFuncion, nuevoEstado).subscribe();
  }

  /**
   * Convierte un array de números, strings u objetos a un array de strings
   * @param arr Array de números, strings u objetos con propiedad 'nombre'
   * @returns Array de strings
   */
  toStringArray(arr: any[] | number[] | string[]): string[] {
    if (!arr || !Array.isArray(arr)) {
      return [];
    }

    return arr.map(item => {
      // Si es un objeto con propiedad 'nombre', usar esa propiedad
      if (typeof item === 'object' && item !== null && 'nombre' in item) {
        return item.nombre.toString();
      }
      // Si es primitivo, convertir a string directamente
      return item.toString();
    });
  }

}
