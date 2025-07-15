import { Component, OnInit } from '@angular/core';
import { Etiquetas } from '@core/models/etiquetas.model';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EtiquetasService } from '@features/catalog';
import { AlertaService } from '@core/services';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-etiquetas',
  imports: [CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './etiquetas.component.html',
  styleUrl: './etiquetas.component.css'
})
export class EtiquetasComponent implements OnInit {
  etiquetas: Etiquetas[] = [];
  etiquetasFiltrados: Etiquetas[] = [];
  filtroEtiquetas: string = '';
  formEtiquetas: FormGroup;
  total: number = 0;
  etiquetaEditando: number | null = null;
  nombreTemporal: string = '';

  constructor(private etiquetaService: EtiquetasService,
    private alerta: AlertaService) {

    this.formEtiquetas = new FormGroup({
      nombre: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
    this.cargarEtiqueta();
  }
  // Activar modo edición
  activarEdicion(etiqueta: Etiquetas) {
    this.etiquetaEditando = etiqueta.id_etiqueta;
    this.nombreTemporal = etiqueta.nombre;
  }

  // Guardar cambios
  guardarEdicion(etiqueta: Etiquetas) {
    if (this.nombreTemporal.trim()) {
      etiqueta.nombre = this.nombreTemporal.trim();
      this.updateEtiqueta(etiqueta);
      this.cancelarEdicion();
    }
  }

  // Cancelar edición
  cancelarEdicion() {
    this.etiquetaEditando = null;
    this.nombreTemporal = '';
  }

  // Actualizar en el backend
  updateEtiqueta(etiqueta: Etiquetas) {
    this.etiquetaService.updateEtiquetas(etiqueta)
      .subscribe({
        next: () => {
          this.alerta.success('', 'Etiqueta actualizada correctamente');
        },
        error: () => {
          this.alerta.error('', 'Error al actualizar la etiqueta');
        }
      });
  }
  cargarEtiqueta(): void {
    this.etiquetaService.getEtiquetas().subscribe({
      next: (data) => {
        this.etiquetas = data;
        this.aplicarFiltro();
      },
      error: () => {
        this.alerta.error('Error', 'No se pudieron cargar las etiquetas');
      }
    });

  }
  aplicarFiltro(): void {
    const termino = this.filtroEtiquetas.toLowerCase().trim();
    this.etiquetasFiltrados = this.etiquetas
      .filter(g => g.nombre.toLowerCase().includes(termino))
      .sort((a, b) => a.id_etiqueta - b.id_etiqueta);
    this.total = this.etiquetasFiltrados.length;
  }

  totalEtiqueta(): number {
    return this.etiquetasFiltrados.length;
  }

  addEtiqueta(): void {
    if (!this.formEtiquetas.valid) {
      this.alerta.error('Formulario Inválido', 'Ingrese un nombre');
      return;
    }

    const obj = this.formEtiquetas.value as Etiquetas;
    this.etiquetaService.addEtiquetas(obj).subscribe({
      next: () => {
        this.alerta.success('Etiqueta creada', 'La etiqueta se guardó correctamente');
        this.formEtiquetas.reset();
        this.cargarEtiqueta();
      },
      error: () => {
        this.alerta.error('Error', 'Error al guardar la etiqueta');
      }
    });
  }

  deleteEtiqueta(id: number, nombre: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Esta acción eliminará la etiqueta ${nombre} permanentemente`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.etiquetaService.deleteEtiquetas(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La etiqueta ha sido eliminada correctamente', 'success');
            this.cargarEtiqueta();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar la etiqueta.', 'error');
          }
        });
      }
    });
  }
}
