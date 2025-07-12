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
        console.log('🎭 Películas recibidas para eventos:', peliculas.length);
        
        // Filtrar películas que tengan etiquetas "Eventos" o "Especiales"
        this.eventosEspeciales = peliculas.filter(pelicula => {
          // Verificar si las etiquetas contienen "Eventos" o "Especiales"
          if (!pelicula.etiquetas) return false;
          
          console.log('🏷️ Etiquetas de', pelicula.titulo, ':', pelicula.etiquetas);
          
          // Manejar tanto arrays de objetos como arrays simples
          let hasEventoEtiqueta = false;
          
          if (Array.isArray(pelicula.etiquetas)) {
            hasEventoEtiqueta = pelicula.etiquetas.some((etiqueta: any) => {
              if (typeof etiqueta === 'object' && etiqueta !== null && 'nombre' in etiqueta) {
                return etiqueta.nombre.toLowerCase().includes('eventos') || 
                       etiqueta.nombre.toLowerCase().includes('especiales');
              } else {
                return String(etiqueta).toLowerCase().includes('eventos') || 
                       String(etiqueta).toLowerCase().includes('especiales');
              }
            });
          }
          
          console.log('✅ Tiene etiqueta de evento:', hasEventoEtiqueta);
          return hasEventoEtiqueta;
        });
        
        console.log('🎭 Eventos especiales encontrados:', this.eventosEspeciales.length);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching películas:', err);
        this.eventosEspeciales = [];
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
