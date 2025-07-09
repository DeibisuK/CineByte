import { Component, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Movie } from '../../../../../core/models/movie.model';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MovieService } from '../../services/movie.service';
import { MovieNavigationService } from '../../services/navigation.service';
import { EdadesComponent } from '../../../../../shared/components/edades/edades.component';
import { Pelicula } from '../../../../../admin/models/pelicula.model';

@Component({
  selector: 'app-eventos-especiales',
  imports: [CommonModule],
  templateUrl: './eventos-especiales.component.html',
  styleUrl: './eventos-especiales.component.css'
})
export class EventosEspecialesComponent implements OnInit, OnDestroy {
  eventosEspeciales: Movie[] = [];
  visibleStart = 0;
  visibleCount = 4;
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
    this.eventosEspeciales = this.movieService.getPeliculasEventoOEspecial() || [];
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
}
