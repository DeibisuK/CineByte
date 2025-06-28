import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Idiomas } from '../../../models/idiomas.model';
import { IdiomasService } from '../../../../services/idiomas.service';
import { AlertaService } from '../../../../services/alerta.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-idiomas',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './idiomas.component.html',
  styleUrl: './idiomas.component.css'
})
export class IdiomasComponent {
  idiomas: Idiomas[] = [];
  idiomasFiltrados: Idiomas[] = [];
  filtroIdioma: string = '';
  formIdioma: FormGroup;
  total: number = 0;
  idiomaEditando: number | null = null;
  nombreTemporal: string = '';

  constructor(private idiomaService: IdiomasService,
    private alerta: AlertaService) {

    this.formIdioma = new FormGroup({
      nombre: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
    this.cargarIdiomas();
  }
  // Activar modo edición
  activarEdicion(idioma: Idiomas) {
    this.idiomaEditando = idioma.id_idioma;
    this.nombreTemporal = idioma.nombre;
  }

  // Guardar cambios
  guardarEdicion(idioma: Idiomas) {
    if (this.nombreTemporal.trim()) {
      idioma.nombre = this.nombreTemporal.trim();
      this.updateIdioma(idioma);
      this.cancelarEdicion();
    }
  }

  // Cancelar edición
  cancelarEdicion() {
    this.idiomaEditando = null;
    this.nombreTemporal = '';
  }

  // Actualizar en el backend
  updateIdioma(idioma: Idiomas) {
    this.idiomaService.updateIdiomas(idioma)
      .subscribe({
        next: () => {
          this.alerta.success('', 'Idioma actualizado correctamente');
        },
        error: () => {
          this.alerta.error('', 'Error al actualizar el idioma');
        }
      });
  }
  cargarIdiomas(): void {
    this.idiomaService.getIdiomas().subscribe({
      next: (data) => {
        this.idiomas = data;
        this.aplicarFiltro(); // Inicializa la lista filtrada
      }
    });

  }
  aplicarFiltro() {
    const termino = this.filtroIdioma.toLowerCase().trim();

    this.idiomasFiltrados = this.idiomas.filter(g =>
      g.nombre.toLowerCase().includes(termino)
    );
    this.idiomasFiltrados = this.idiomasFiltrados.sort((a, b) => a.id_idioma - b.id_idioma);
  }

  totalIdiomas(): number {
    return this.total = this.idiomas.length;
  }


  addIdiomas(): void {
    if (!this.formIdioma.valid) {
      this.alerta.error("Formulario Inválido", "Ingrese un nombre");
      return;
    }

    const obj = this.formIdioma.value as Idiomas;
    try {
      this.idiomaService.addIdiomas(obj).subscribe({
        next: () => {
          this.alerta.success("Idioma creado", "El idioma se guardó correctamente");
          this.formIdioma.reset();
          this.cargarIdiomas();
        },
        error: () => {
          this.alerta.error("Error", "Error al guardar el idioma");
        }
      });
    } catch (error) {
      this.alerta.error("Error", "Error al guardar el idioma");
    }
  }

  deleteIdioma(id: number, nombre: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el idioma ' + nombre + ' permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.idiomaService.deleteIdiomas(id).subscribe({
          next: (res) => {
            Swal.fire('Eliminado', res.mensaje, 'success');
            this.cargarIdiomas();
          },
          error: (err) => {
            const mensaje = err.error?.error || 'No se pudo eliminar el idioma.';
            Swal.fire('Error', mensaje, 'error');
          }
        });
      }
    });
  }
}
