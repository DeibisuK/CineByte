import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Movie } from '../../../../core/models/movie.model';
import { Promotions } from '../../../../core/models/promotions.model';

@Injectable({ providedIn: 'root' })
export class MovieNavigationService {
  constructor(private router: Router) {}

  verDetalle(movie: Movie) {
    const tituloUrl = movie.titulo
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');
    this.router.navigate(['/pelicula', movie.id, tituloUrl]);
  }
    verDetallePromo(promo: Promotions) {
    const tituloUrl = promo.titulo
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');
    this.router.navigate(['/promocion', promo.id, tituloUrl]);
  }
}