import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MovieNavigationService } from '../../services/navigation.service';
import { Pelicula } from '../../../../../admin/models/pelicula.model';
import { PeliculaService } from '../../../../../services/pelicula.service';

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

        // Filtrar películas activas y ordenar por fecha de estreno más reciente
        const peliculasActivas = peliculas.filter(pelicula => pelicula.estado === 'activo');

        this.estrenos = peliculasActivas
          .sort((a, b) => {
            const fechaA = new Date(a.fecha_estreno);
            const fechaB = new Date(b.fecha_estreno);
            return fechaB.getTime() - fechaA.getTime(); // Más recientes primero
          })
          .slice(0, 5); // Tomar los 5 más recientes

        if (this.isBrowser && this.estrenos.length > 0) {
          this.startAutoSlide();
        }
      },
      error: (err: any) => {
        console.error('Error fetching películas:', err);
        this.estrenos = [];
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
   * Convierte un array de números o strings a un array de strings
   * @param arr Array de números o strings
   * @returns Array de strings
   */
  toStringArray(arr: number[] | string[]): string[] {
    return arr.map(x => x.toString());
  }

  /**
   * Obtiene la URL de imagen de manera segura
   * @param movie Película
   * @returns URL de imagen válida
   */
  getImageUrl(movie: Pelicula): string {
    // Verificar si movie existe
    if (!movie) {
      return '/assets/placeholder-image.png';
    }

    // Usar la imagen principal directamente
    return movie.imagen || '/assets/placeholder-image.png';
  }
}
