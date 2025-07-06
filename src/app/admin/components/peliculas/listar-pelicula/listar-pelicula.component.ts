import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Pelicula } from '../../../models/pelicula.model';
import { PeliculaService } from '../../../../services/pelicula.service';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listar-pelicula',
  imports: [CommonModule, RouterLink],
  templateUrl: './listar-pelicula.component.html',
  styleUrl: './listar-pelicula.component.css',
})
export class ListarPeliculaComponent implements OnInit, OnDestroy {
  peliculas: Pelicula[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private peliculaService: PeliculaService
  ) {}

  ngOnInit(): void {
    this.obtenerPeliculas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  obtenerPeliculas(): void {
    this.peliculaService.getPeliculasCompletas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.peliculas = data.sort((a: Pelicula, b: Pelicula) => a.id_pelicula - b.id_pelicula);
        },
        error: (error) => {
          console.error('Error al obtener películas', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar las películas. Por favor, intenta nuevamente.',
            confirmButtonText: 'Entendido'
          });
        },
      });
  }

  tipoEstado(tipo: string): string {
    if (tipo === 'proximamente') {
      return 'Proximamente';
    } else if (tipo === 'activo') {
      return 'Activo';
    }
    return 'Retirado';
  }

  eliminarPelicula(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la película permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.peliculaService.deletePelicula(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (res) => {
              Swal.fire('Eliminado', res.mensaje, 'success');
              this.obtenerPeliculas();
            },
            error: (err) => {
              const mensaje =
                err.error?.error || 'No se pudo eliminar la película.';
              Swal.fire('Error', mensaje, 'error');
            },
          });
      }
    });
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
