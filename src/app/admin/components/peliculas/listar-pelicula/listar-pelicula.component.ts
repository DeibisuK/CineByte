import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Pelicula } from '@core/models/pelicula.model';
import { PeliculaService } from '@features/movies/services/pelicula.service';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listar-pelicula',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './listar-pelicula.component.html',
  styleUrl: './listar-pelicula.component.css',
})
export class ListarPeliculaComponent implements OnInit, OnDestroy {
  peliculas: Pelicula[] = [];
  peliculasFiltradas: Pelicula[] = [];
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  
  // Estados de carga
  isLoadingPeliculas = true;
  isDeleting = false;
  isSearching = false;
  
  // Búsqueda
  filtroPelicula: string = '';

  constructor(
    private peliculaService: PeliculaService
  ) {}

  ngOnInit(): void {
    this.obtenerPeliculas();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.aplicarFiltro();
      });
  }

  obtenerPeliculas(): void {
    this.isLoadingPeliculas = true;
    this.peliculaService.getPeliculasCompletas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.peliculas = data.sort((a: Pelicula, b: Pelicula) => a.id_pelicula - b.id_pelicula);
          this.aplicarFiltro(); // Inicializa la lista filtrada
          this.isLoadingPeliculas = false;
        },
        error: (error) => {
          console.error('Error al obtener películas', error);
          this.isLoadingPeliculas = false;
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
    if (this.isDeleting) return; // Prevenir múltiples eliminaciones simultáneas
    
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la película permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isDeleting = true;
        this.peliculaService.deletePelicula(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (res) => {
              this.isDeleting = false;
              Swal.fire('Eliminado', res.mensaje, 'success');
              this.obtenerPeliculas();
            },
            error: (err) => {
              this.isDeleting = false;
              const mensaje =
                err.error?.error || 'No se pudo eliminar la película.';
              Swal.fire('Error', mensaje, 'error');
            },
          });
      }
    });
  }

  /**
   * Convierte un array de números, strings u objetos a un array de strings
   * @param arr Array de números, strings u objetos
   * @returns Array de strings
   */
  toStringArray(arr: any[]): string[] {
    if (!arr || !Array.isArray(arr)) return [];
    
    return arr.map(item => {
      if (typeof item === 'object' && item !== null && 'nombre' in item) {
        return item.nombre.toString();
      }
      return item.toString();
    });
  }

  // Métodos de búsqueda
  onSearchChange(): void {
    this.isSearching = true;
    this.searchSubject.next(this.filtroPelicula);
  }

  aplicarFiltro(): void {
    const termino = this.filtroPelicula.toLowerCase().trim();
    
    if (termino === '') {
      this.peliculasFiltradas = [...this.peliculas];
    } else {
      this.peliculasFiltradas = this.peliculas.filter(pelicula =>
        pelicula.titulo.toLowerCase().includes(termino)
      );
    }
    
    this.isSearching = false;
  }

  limpiarBusqueda(): void {
    this.filtroPelicula = '';
    this.aplicarFiltro();
  }

  totalPeliculas(): number {
    return this.peliculas.length;
  }
}
