import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Promotions } from '../../../../../core/models/promotions.model';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PromotionsService } from '../../../movies/services/promotions.service';
import { MovieNavigationService } from '../../../movies/services/navigation.service';

@Component({
  selector: 'app-carousel-promos',
  imports: [CommonModule],
  templateUrl: './carousel-promos.component.html',
  styleUrl: './carousel-promos.component.css'
})
export class CarouselPromosComponent {
  promociones: Promotions[] = [];
  visibleStart = 0;
  visibleCount = 1; // Mostrar solo 1 promoción a la vez
  autoSlideInterval: any;
  isBrowser: boolean;
  hoveredIndex: number = -1;

  constructor(
    private promoService: PromotionsService, private promoNav: MovieNavigationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.promoService.getAllPromotions().subscribe(promos => {
      this.promociones = promos;
      if (this.isBrowser) {
        this.startAutoSlide();
      }
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.autoSlideInterval);
  }

  next() {
    if (this.visibleStart + this.visibleCount < this.promociones.length) {
      this.visibleStart++;
    } else {
      this.visibleStart = 0; // Vuelve al inicio si llega al final
    }
  }

  prev() {
    if (this.visibleStart > 0) {
      this.visibleStart--;
    } else {
      this.visibleStart = this.promociones.length - this.visibleCount; // Va al final si está al inicio
    }
  }

  goTo(index: number) {
    this.visibleStart = index;
  }

  get visiblePromos() {
    return this.promociones.slice(this.visibleStart, this.visibleStart + this.visibleCount);
  }

  get indicators() {
    return Array.from({ length: this.promociones.length }, (_, i) => i);
  }

  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.next();
    }, 5000); // Cambia cada 5 segundos
  }

    verDetalle(promo: Promotions) {
      this.promoNav.verDetallePromo(promo);
    }
}
