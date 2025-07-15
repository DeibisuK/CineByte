import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MovieNavigationService } from '../../services/navigation.service';
import { Pelicula } from '@core/models/pelicula.model';
import { PeliculaService } from '@features/movies/services/pelicula.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-carousel-inicial',
  imports: [CommonModule],
  templateUrl: './carousel-inicial.component.html',
  styleUrl: './carousel-inicial.component.css'
})
export class CarouselInicialComponent {
  estrenos: Pelicula[] = [];
  visibleStart = 0;
  autoSlideInterval: any;
  isBrowser: boolean;
  hoveredIndex: number = -1;
  loading: boolean = true;
  
  // Cache para imágenes seleccionadas (evita el error de ExpressionChanged)
  private imageCache: Map<number, string> = new Map();

  constructor(
    private peliculasService: PeliculaService,
    private movieNav: MovieNavigationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.loading = true;
    
    // Primero obtenemos todas las películas básicas
    this.peliculasService.getPeliculas().subscribe({
      next: (peliculas: Pelicula[]) => {
        // Filtrar películas activas y ordenar por fecha de estreno más reciente
        const peliculasActivas = peliculas.filter(pelicula => pelicula.estado === 'activo');

        const peliculasOrdenadas = peliculasActivas
          .sort((a, b) => {
            const fechaA = new Date(a.fecha_estreno);
            const fechaB = new Date(b.fecha_estreno);
            return fechaB.getTime() - fechaA.getTime(); // Más recientes primero
          })
          .slice(0, 5); // Tomar los 5 más recientes

        // Ahora obtenemos los datos completos para cada película seleccionada
        const peliculasCompletas$ = peliculasOrdenadas.map(pelicula => 
          this.peliculasService.getPeliculaByIdComplete(pelicula.id_pelicula)
        );

        // Ejecutar todas las consultas en paralelo
        if (peliculasCompletas$.length > 0) {
          Promise.all(peliculasCompletas$.map(obs => obs.toPromise()))
            .then((peliculasCompletas) => {
              this.estrenos = peliculasCompletas.filter(p => p != null);
              this.loading = false;

              if (this.isBrowser && this.estrenos.length > 0) {
                this.startAutoSlide();
              }
            })
            .catch((err) => {
              console.error('Error obteniendo datos completos:', err);
              // Fallback a películas básicas
              this.estrenos = peliculasOrdenadas;
              this.loading = false;
            });
        } else {
          this.estrenos = [];
          this.loading = false;
        }
      },
      error: (err: any) => {
        console.error('Error fetching películas:', err);
        this.estrenos = [];
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.autoSlideInterval);
  }

  next() {
    if (this.estrenos.length === 0) {
      return;
    }
    this.visibleStart = (this.visibleStart + 1) % this.estrenos.length;
  }

  prev() {
    if (this.estrenos.length === 0) {
      return;
    }
    this.visibleStart = (this.visibleStart - 1 + this.estrenos.length) % this.estrenos.length;
  }

  goTo(index: number) {
    this.visibleStart = index;
  }

  get visibleMovies() {
    if (this.estrenos.length === 0 || !this.estrenos[this.visibleStart]) {
      return [];
    }
    return [this.estrenos[this.visibleStart]];
  }

  get indicators() {
    return Array.from({ length: this.estrenos.length }, (_, i) => i);
  }

  startAutoSlide() {
    if (this.estrenos.length === 0) {
      return;
    }
    this.autoSlideInterval = setInterval(() => this.next(), 5000);
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

  /**
   * Obtiene la URL de imagen de manera segura, priorizando las imágenes del carrusel
   * @param movie Película
   * @returns URL de imagen válida
   */
  getImageUrl(movie: Pelicula): string {
    // Verificar si movie existe
    if (!movie) {
      console.log('Película no existe');
      return '/assets/placeholder-image.png';
    }

    // Si ya tenemos una imagen cacheada para esta película, usarla
    if (this.imageCache.has(movie.id_pelicula)) {
      return this.imageCache.get(movie.id_pelicula)!;
    }

    let selectedImage: string;

    // Priorizar las imágenes del carrusel si existen
    if (movie.img_carrusel && movie.img_carrusel.length > 0) {
      // Usar la primera imagen del carrusel para consistencia
      selectedImage = movie.img_carrusel[0].url;
    } else {
      selectedImage = movie.imagen || '/assets/placeholder-image.png';
    }

    // Cachear la imagen seleccionada
    this.imageCache.set(movie.id_pelicula, selectedImage);
    return selectedImage;
  }
}
