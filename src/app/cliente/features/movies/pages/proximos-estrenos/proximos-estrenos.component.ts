import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MovieNavigationService } from '../../services/navigation.service';
import { EdadesComponent } from '../../../../../shared/components/edades/edades.component';
import { Pelicula } from '@core/models/pelicula.model';
import { PeliculaService } from '@features/movies/services/pelicula.service';

@Component({
  selector: 'app-proximos-estrenos',
  imports: [CommonModule,EdadesComponent],
  templateUrl: './proximos-estrenos.component.html',
  styleUrl: './proximos-estrenos.component.css'
})
export class ProximosEstrenosComponent {
  upcomingMovies: Pelicula[] = [];
  visibleStart = 0;
  visibleCount = 4;
  autoSlideInterval: any;
  isBrowser: boolean;
  loading: boolean = true; // Agregar loading

 constructor(
    private peliculasService: PeliculaService,
    private movieNav: MovieNavigationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.loading = true;
    this.peliculasService.getPeliculasCompletas().subscribe({
      next: (peliculas: Pelicula[]) => {
        // Filtrar solo las películas con estado "proximamente"
        this.upcomingMovies = peliculas.filter(pelicula => pelicula.estado === 'proximamente');
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching películas:', err);
        this.upcomingMovies = [];
        this.loading = false;
      }
    });
    
    if (this.isBrowser) {
      this.updateVisibleCount();
      this.startAutoSlide();
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.autoSlideInterval);
  }

  @HostListener('window:resize')
  onResize() {
    if (this.isBrowser) {
      this.updateVisibleCount();
      if (this.visibleStart + this.visibleCount > this.upcomingMovies.length) {
        this.visibleStart = Math.max(0, this.upcomingMovies.length - this.visibleCount);
      }
    }
  }

  updateVisibleCount() {
    if (!this.isBrowser) return;
    const width = window.innerWidth;
    if (width <= 600) {
      this.visibleCount = 1;
    } else if (width <= 900) {
      this.visibleCount = 2;
    } else {
      this.visibleCount = 4;
    }
  }

  next() {
    if (this.visibleStart + this.visibleCount < this.upcomingMovies.length) {
      this.visibleStart++;
    }
  }

  prev() {
    if (this.visibleStart > 0) {
      this.visibleStart--;
    }
  }

  goTo(index: number) {
    this.visibleStart = index;
  }

  get visibleMovies() {
    return this.upcomingMovies.slice(this.visibleStart, this.visibleStart + this.visibleCount);
  }

  get indicators() {
    const total = Math.max(this.upcomingMovies.length - this.visibleCount + 1, 1);
    return Array.from({ length: total }, (_, i) => i);
  }

  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      if (this.visibleStart + this.visibleCount < this.upcomingMovies.length) {
        this.visibleStart++;
      } else {
        this.visibleStart = 0;
      }
    }, 5000);
  }

  verDetalle(movie: Pelicula) {
    this.movieNav.verDetalle(movie);
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
