import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Promocion } from '@core/models/promocion.model';
import { Pelicula } from '@core/models/pelicula.model';

@Injectable({ providedIn: 'root' })
export class MovieNavigationService {
  constructor(private router: Router) {}

  verDetalle(movie:  Pelicula) {
    const tituloUrl = movie.titulo
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');
    this.router.navigate(['/pelicula', movie.id_pelicula, tituloUrl]);
  }
    verDetallePromo(promo: Promocion) {
    const tituloUrl = promo.titulo
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');
    this.router.navigate(['/promocion', promo.id_promo, tituloUrl]);
  }
}