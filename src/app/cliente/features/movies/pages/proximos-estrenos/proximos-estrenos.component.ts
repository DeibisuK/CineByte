import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { Movie } from '../../../../../core/models/movie.model';
import { MovieService } from '../../services/movie.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { EdadesComponent } from '../../../../../shared/components/edades/edades.component';

@Component({
  selector: 'app-proximos-estrenos',
  imports: [CommonModule,EdadesComponent],
  templateUrl: './proximos-estrenos.component.html',
  styleUrl: './proximos-estrenos.component.css'
})
export class ProximosEstrenosComponent {
  upcomingMovies: Movie[] = [];
  visibleStart = 0;
  visibleCount = 4;
  autoSlideInterval: any;
  isBrowser: boolean;

 constructor(
    private movieService: MovieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.upcomingMovies = this.movieService.getUpcomingMovies() || [];
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
}
