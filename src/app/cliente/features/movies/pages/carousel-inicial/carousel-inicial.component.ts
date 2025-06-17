import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Movie } from '../../../../../core/models/movie.model';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MovieService } from '../../services/movie.service';
import { MovieNavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-carousel-inicial',
  imports: [CommonModule],
  templateUrl: './carousel-inicial.component.html',
  styleUrl: './carousel-inicial.component.css'
})
export class CarouselInicialComponent {
  estrenos: Movie[] = [];
  visibleStart = 0;
  autoSlideInterval: any;
  isBrowser: boolean;
  hoveredIndex: number = -1;

  constructor(
    private movieService: MovieService, private movieNav: MovieNavigationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

ngOnInit(): void {
  this.movieService.getAllMovies().subscribe(movies => {
    const now = new Date();
    this.estrenos = movies
      .filter(movie => movie.fechaEstreno)
      .sort((a, b) => {
        const fechaA = typeof a.fechaEstreno === 'string' ? new Date(a.fechaEstreno) : a.fechaEstreno!;
        const fechaB = typeof b.fechaEstreno === 'string' ? new Date(b.fechaEstreno) : b.fechaEstreno!;
        return Math.abs(+fechaA - +now) - Math.abs(+fechaB - +now);
      })
      .slice(0, 5);
    if (this.isBrowser) {
      this.startAutoSlide();
    }
  });
}

  ngOnDestroy(): void {
    clearInterval(this.autoSlideInterval);
  }

  next() {
    this.visibleStart = (this.visibleStart + 1) % this.estrenos.length;
  }

  prev() {
    this.visibleStart = (this.visibleStart - 1 + this.estrenos.length) % this.estrenos.length;
  }

  goTo(index: number) {
    this.visibleStart = index;
  }

  get visibleMovies() {
    return [this.estrenos[this.visibleStart]];
  }

  get indicators() {
    return Array.from({ length: this.estrenos.length }, (_, i) => i);
  }

  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => this.next(), 5000);
  }

  verDetalle(movie: Movie) {
    this.movieNav.verDetalle(movie);
  }
}
