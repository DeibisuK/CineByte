import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Promocion } from '@core/models';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PromocionService } from '@features/promotions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carousel-promos',
  imports: [CommonModule],
  templateUrl: './carousel-promos.component.html',
  styleUrl: './carousel-promos.component.css'
})
export class CarouselPromosComponent {
  promociones: Promocion[] = [];
  visibleStart = 0;
  visibleCount = 1; // Mostrar solo 1 promoción a la vez
  autoSlideInterval: any;
  isBrowser: boolean;
  hoveredIndex: number = -1;
  loading: boolean = true;

  constructor(
    private promoService: PromocionService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.loading = true;
    this.promoService.getPromociones().subscribe({
      next: (promos: Promocion[]) => {
        this.promociones = promos;
        this.loading = false;
        if (this.isBrowser) {
          this.startAutoSlide();
        }
      },
      error: (err: any) => {
        console.error('Error al cargar promociones:', err);
        this.loading = false;
        // Aquí puedes mostrar un mensaje de error con SweetAlert o similar si lo deseas
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

  verDetalle(promo: Promocion) {
    this.router.navigate(['/promociones/detalle', promo.id_promo]);
  }
}
