import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FuncionesList } from '@core/models/funciones.model';
import { FuncionesService } from '@features/movies/services/funciones.service';
import { AlertaService } from '@core/services';

@Component({
  selector: 'app-listar-funciones',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './listar-funciones.component.html',
  styleUrl: './listar-funciones.component.css'
})
export class ListarFuncionesComponent implements OnInit {
  
  funciones: FuncionesList[] = [];
  filteredFunciones: FuncionesList[] = [];
  isLoading: boolean = true;
  
  // Filtros
  filterById: string = '';
  filterByEstado: string = '';
  filterByDate: string = '';

  constructor(
    private funcionesService: FuncionesService,
    private alertaService: AlertaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarFunciones();
  }

  cargarFunciones(): void {
    this.isLoading = true;
    this.funcionesService.getFuncionesConDetalles().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
        }
        this.funciones = data;
        this.filteredFunciones = [...data];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar funciones:', error);
        this.alertaService.error('Error', 'No se pudieron cargar las funciones');
        this.isLoading = false;
      }
    });
  }

  filterFunciones(): void {
    this.filteredFunciones = this.funciones.filter(funcion => {
      const matchesId = !this.filterById || 
        funcion.id_funcion.toString().includes(this.filterById.toLowerCase());

      const matchesEstado = !this.filterByEstado || 
        funcion.estado === this.filterByEstado;
      
      const matchesDate = !this.filterByDate || 
        this.formatDateForFilter(new Date(funcion.fecha_hora_inicio)) === this.filterByDate;
      
      return matchesId && matchesEstado && matchesDate;
    });
  }

  clearFilters(): void {
    this.filterById = '';
    this.filterByEstado = '';
    this.filterByDate = '';
    this.filteredFunciones = [...this.funciones];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateForFilter(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Método para validar y formatear URLs de trailers
  isValidTrailerUrl(url: string): boolean {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  // Método para obtener precio con validación
  getPrecio(funcion: FuncionesList): string {
    // Intentar diferentes nombres de campo que podría tener el backend
    const precio = funcion.precio_funcion || (funcion as any).precio || (funcion as any).price;
    
    if (precio && typeof precio === 'number') {
      return precio.toFixed(2);
    }
    return 'No disponible';
  }

  // Método para obtener URL del trailer con validación
  getTrailerUrl(funcion: FuncionesList): string {
    return funcion.trailer_url || (funcion as any).trailer || (funcion as any).url_trailer || '';
  }

  editarFuncion(id: number): void {
    this.router.navigate(['/admin/funciones/edit', id]);
  }

  eliminarFuncion(id: number): void {
    this.alertaService.confirmacion(
      '¿Estás seguro?',
      `¿Estás seguro de que quieres eliminar la función ${id}?`,
      'Sí, eliminar',
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        // Aquí irías la lógica para eliminar
        this.funcionesService.deleteFuncion(id).subscribe({
          next: () => {
            this.alertaService.success('Eliminado', `Función ${id} eliminada correctamente`);
            this.cargarFunciones(); // Recargar la lista
          },
          error: (error) => {
            console.error('Error al eliminar función:', error);
            this.alertaService.error('Error', 'No se pudo eliminar la función');
          }
        });
      }
    });
  }

  nuevaFuncion(): void {
    this.router.navigate(['/admin/funciones/add']);
  }
}
