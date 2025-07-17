import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PromocionService } from '@features/promotions/services/promocion.service';
import { Promocion } from '@core/models/promocion.model';

@Component({
  selector: 'app-promociones-showcase',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './promociones-showcase.component.html',
  styleUrl: './promociones-showcase.component.css'
})
export class PromocionesShowcaseComponent implements OnInit {
  promocionesActivas: Promocion[] = [];
  isLoading: boolean = true;

  constructor(private promocionService: PromocionService) {}

  ngOnInit(): void {
    this.cargarPromocionesActivas();
  }

  cargarPromocionesActivas(): void {
    this.isLoading = true;
    this.promocionService.getActivePromociones().subscribe({
      next: (promociones) => {
        // Filtrar solo promociones publicitarias y de descuento para mostrar
        console.log('Promociones cargadas:', promociones);
        this.promocionesActivas = promociones
          .filter(promo => promo.tipo_promocion === 'Publicitaria' || promo.tipo_promocion === 'Descuento')
          .slice(0, 3); // Mostrar máximo 3 promociones
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando promociones:', error);
        this.isLoading = false;
      }
    });
  }

  getPromocionIcon(tipo: string): string {
    switch(tipo) {
      case 'Descuento': return 'fas fa-percentage';
      case 'Cupon': return 'fas fa-ticket-alt';
      case 'Multiplicador': return 'fas fa-times';
      case 'Publicitaria': return 'fas fa-bullhorn';
      default: return 'fas fa-star';
    }
  }

  getPromocionColor(tipo: string): string {
    switch(tipo) {
      case 'Descuento': return '#4caf50';
      case 'Cupon': return '#ff9800';
      case 'Multiplicador': return '#2196f3';
      case 'Publicitaria': return '#e91e63';
      default: return '#ffd700';
    }
  }

  trackByPromocionId(index: number, promocion: Promocion): number {
    return promocion.id_promo;
  }

  abrirEnlace(url: string): void {
    window.open(url, '_blank');
  }
}
