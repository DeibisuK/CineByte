import { Component } from '@angular/core';
import { Movie } from '../../../../../core/models/movie.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { CommonModule } from '@angular/common';
import { CarouselEstrenosComponent } from '../carousel-estrenos/carousel-estrenos.component';

@Component({
  selector: 'app-detalle-pelicula',
  imports: [CommonModule,CarouselEstrenosComponent],
  templateUrl: './detalle-pelicula.component.html',
  styleUrl: './detalle-pelicula.component.css'
})
export class DetallePeliculaComponent {
  pelicula?: Movie;
  cantidad = 1;
  idiomaSeleccionado: string = '';
  mostrarTrailer = false;
  safeTrailerUrl?: SafeResourceUrl;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private movieService: MovieService,
    private router: Router
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.pelicula = this.movieService.getMovieById(id);
    this.idiomaSeleccionado = this.pelicula?.idiomas?.[0] || '';
    if (this.pelicula?.trailer) {
      this.safeTrailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${this.pelicula.trailer}?autoplay=1`
      );
    }
  }

  cambiarCantidad(delta: number) {
    if (this.cantidad + delta >= 1) {
      this.cantidad += delta;
    }
  }

  abrirTrailer() {
    this.mostrarTrailer = true;
  }

  cerrarTrailer() {
    this.mostrarTrailer = false;
  }

  irASiguiente() {
    this.router.navigate(['/compra', this.pelicula?.titulo]);
  }
}
