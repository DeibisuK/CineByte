import { Component } from '@angular/core';
import { Promotions } from '../../../../../core/models/promotions.model';
import { PromotionsService } from '../../../movies/services/promotions.service';
import { MovieNavigationService } from '../../../movies/services/navigation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-promos',
  imports: [CommonModule],
  templateUrl: './promos.component.html',
  styleUrl: './promos.component.css'
})
export class PromosComponent {
promociones: Promotions[] = [];
  hoveredIndex: number = -1;

  constructor(private promoService: PromotionsService, private promoNav: MovieNavigationService) {}

  ngOnInit(): void {
    this.promoService.getAllPromotions().subscribe(promos => {
      this.promociones = promos;
    });
  }

  verDetalle(promo: Promotions) {
    this.promoNav.verDetallePromo(promo);
  }
}
