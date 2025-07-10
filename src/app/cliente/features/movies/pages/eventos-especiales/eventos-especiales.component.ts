import { Component, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MovieNavigationService } from '../../services/navigation.service';
import { EdadesComponent } from '../../../../../shared/components/edades/edades.component';
import { Pelicula } from '@core/models/pelicula.model';
import { PeliculaService } from '@features/movies/services/pelicula.service';

@Component({
  selector: 'app-eventos-especiales',
  imports: [CommonModule,EdadesComponent],
  templateUrl: './eventos-especiales.component.html',
  styleUrl: './eventos-especiales.component.css'
})
export class EventosEspecialesComponent implements OnInit, OnDestroy {
  eventosEspeciales: Pelicula[] = [];
  visibleStart = 0;
  visibleCount = 4;
  autoSlideInterval: any;
  isBrowser: boolean;
  hoveredIndex: number = -1;

 constructor(
    private peliculasService: PeliculaService, 
    private movieNav: MovieNavigationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.peliculasService.getPeliculasCompletas().subscribe({
      next: (peliculas: Pelicula[]) => {
        // Filtrar películas que tengan etiquetas "Eventos" o "Especiales"
        this.eventosEspeciales = peliculas.filter(pelicula => {
          // Verificar si las etiquetas contienen "Eventos" o "Especiales"
          if (!pelicula.etiquetas) return false;
          
          const etiquetasString = Array.isArray(pelicula.etiquetas) 
            ? pelicula.etiquetas.join(',').toLowerCase()
            : String(pelicula.etiquetas).toLowerCase();
          
          return etiquetasString.includes('eventos') || etiquetasString.includes('especiales');
        });
      },
      error: (err: any) => {
        console.error('Error fetching películas:', err);
        this.eventosEspeciales = [];
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
      if (this.visibleStart + this.visibleCount > this.eventosEspeciales.length) {
        this.visibleStart = Math.max(0, this.eventosEspeciales.length - this.visibleCount);
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
    if (this.visibleStart + this.visibleCount < this.eventosEspeciales.length) {
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
    return this.eventosEspeciales.slice(this.visibleStart, this.visibleStart + this.visibleCount);
  }

  get indicators() {
    const total = Math.max(this.eventosEspeciales.length - this.visibleCount + 1, 1);
    return Array.from({ length: total }, (_, i) => i);
  }

  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      if (this.visibleStart + this.visibleCount < this.eventosEspeciales.length) {
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
   * Convierte un array de números o strings a un array de strings
   * @param arr Array de números o strings
   * @returns Array de strings
   */
  toStringArray(arr: number[] | string[]): string[] {
    return arr.map(x => x.toString());
  }
}
