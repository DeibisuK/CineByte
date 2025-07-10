import { Component, OnInit } from '@angular/core';
import { Promocion } from '@core/models/promocion.model';
import { PromocionService } from '@features/promotions/services/promocion.service';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-listar-promociones',
  imports: [CommonModule,RouterModule],
  templateUrl: './listar-promociones.component.html',
  styleUrl: './listar-promociones.component.css'
})
export class ListarPromocionesComponent implements OnInit {
  promociones: Promocion[] = [];
  hoveredIndex: number = -1;
  loading: boolean = true;

  constructor(
    private promocionService: PromocionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPromociones();
  }

  isClientRoute(): boolean {
    return this.router.url.includes('admin/promociones/list');
  }

  cargarPromociones(): void {
    this.loading = true;
    this.promocionService.getPromociones().subscribe({
      next: (data) => {
        this.promociones = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar promociones:', err);
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las promociones',
          confirmButtonColor: '#3085d6'
        });
      }
    });
  }

  verDetalle(promo: Promocion): void {
    this.router.navigate(['/admin/promociones/detalle', promo.id_promo]);
  }

  editarPromocion(promo: Promocion, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/admin/promociones/editar', promo.id_promo]);
  }

  eliminarPromocion(promo: Promocion, event: Event): void {
    event.stopPropagation();
    
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar la promoción "${promo.titulo}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.promocionService.deletePromocion(promo.id_promo).subscribe({
          next: () => {
            this.cargarPromociones();
            Swal.fire(
              '¡Eliminada!',
              'La promoción ha sido eliminada.',
              'success'
            );
          },
          error: (err) => {
            console.error('Error al eliminar promoción:', err);
            Swal.fire(
              'Error',
              'No se pudo eliminar la promoción',
              'error'
            );
          }
        });
      }
    });
  }

  getEtiquetaTipo(tipo: string): string {
    switch(tipo) {
      case 'Descuento': return 'Descuento';
      case 'Multiplicador': return 'Multiplicador';
      case 'Cupon': return 'Cupón';
      case 'Publicitaria': return 'Publicidad';
      default: return tipo;
    }
  }
}