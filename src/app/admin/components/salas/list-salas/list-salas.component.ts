import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Asiento, Sala } from '@core/models/salas.model';
import { SalasService } from '@features/venues/services/salas.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-list-salas',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './list-salas.component.html',
  styleUrl: './list-salas.component.css'
})
export class ListSalasComponent {
  cargando = false;
  filtroNombre: string = '';
  filtroTipo: string = '';
  filtroAsientos: number = 0;
  salas: Sala[] = [];
  salasFiltradas: Sala[] = []
  totalSalas: number = 0;
  totalAsientos: number = 0;
  promedioAsientos: number = 0;
  vistaPrevia: {
    letra: string, asientos: {
      numero: number;
      tipo: 'normal' | 'espacio';
    }[]
  }[] = [];
  asientosNoUtilizados: string[] = [];
  asientos: Asiento[] = [];
  mostrarAsientos = false;
  animacionAsientos = '';
  constructor(private salaService: SalasService, private router: Router) { }
  ngOnInit() {
    this.cargarSalas();
  }

  cargarSalas() {
    this.cargando = true;

    this.salaService.getSalas().subscribe({
      next: (res) => {
        this.salas = res;
        this.salasFiltradas = [...this.salas];
        this.actualizarEstadisticas();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando salas:', err);
        this.cargando = false;
      }
    });
  }

  crearSala() {
    this.router.navigate(['/admin/salas/add']);
  }

  verSala(id: number) {
    this.getAsientos(id);
  }

  editarSala(id: number) {
    this.router.navigate(['/admin/salas/edit/', id]);
  }

  eliminarSala(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la sala permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.salaService.deleteSala(id).subscribe({
          next: (res) => {
            const mensaje = res.message || res.mensaje || 'Sala eliminada correctamente.';
            Swal.fire('Eliminado', mensaje, 'success');
            this.cargarSalas();
          },
          error: (err) => {
            const mensaje = err.error?.error || err.error?.mensaje || 'No se pudo eliminar la sala.';
            Swal.fire('Error', mensaje, 'error');
          },
        });
      }
    });
  }
  // Métodos para estadísticas y filtros (se agregarán luego)
  actualizarEstadisticas() {
    this.totalSalas = this.salasFiltradas.length;
    this.totalAsientos = this.salasFiltradas.reduce((sum, s) => sum + s.cantidad_asientos, 0);
    this.promedioAsientos = this.totalSalas > 0 ? Math.round(this.totalAsientos / this.totalSalas) : 0;
  }

  aplicarFiltros() {
    this.salasFiltradas = this.salas.filter(sala => {
      const coincideNombre = !this.filtroNombre || sala.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());
      const coincideTipo = !this.filtroTipo || sala.tipo_sala === this.filtroTipo;
      const coincideAsientos = sala.cantidad_asientos >= (this.filtroAsientos || 0);

      return coincideNombre && coincideTipo && coincideAsientos;
    });

    this.actualizarEstadisticas();
  }

  limpiarFiltros() {
    this.filtroNombre = '';
    this.filtroTipo = '';
    this.filtroAsientos = 0;
    this.aplicarFiltros();
  }

  generarVistaPreviaDesdeAsientos(asientos: Asiento[]) {
    const agrupados: { [letra: string]: { numero: number; tipo: 'normal' | 'espacio' }[] } = {};

    asientos.forEach(a => {
      if (!agrupados[a.fila]) agrupados[a.fila] = [];
      agrupados[a.fila].push({ numero: a.columna, tipo: a.tipo as 'normal' | 'espacio' });
    });

    this.vistaPrevia = Object.keys(agrupados)
      .sort()
      .map(fila => ({
        letra: fila,
        asientos: agrupados[fila].sort((a, b) => a.numero - b.numero)
      }));
    this.mostrarAsientos = true;
    this.animacionAsientos = 'fade-in';
  }

  getAsientos(id: number) {
    this.salaService.getAsientosPorSala(id).subscribe({
      next: (asientos) => {
        this.asientos = asientos;
        this.generarVistaPreviaDesdeAsientos(this.asientos);
      }
    });
  }

  closeAsientos() {
    this.animacionAsientos = 'fade-out';
    setTimeout(() => {
      this.mostrarAsientos = false;
      this.vistaPrevia = [];
    }, 200); // debe coincidir con la duración del fadeOut
  }
}
