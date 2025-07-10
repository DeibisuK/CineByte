import { Component } from '@angular/core';
import { Generos } from '@core/models/generos.model';
import { GenerosService } from '@features/catalog';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { AlertaService } from '@core/services';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-generos',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatDividerModule, MatListModule, MatIconModule, FormsModule],
  templateUrl: './generos.component.html',
  styleUrl: './generos.component.css'
})
export class GenerosComponent {
  generos: Generos[] = [];
  generosFiltrados: Generos[] = [];
  filtroGenero: string = '';
  formGenero: FormGroup;
  total: number = 0;
  generoEditando: number | null = null;
  nombreTemporal: string = '';

  constructor(private generoService: GenerosService,
    private alerta: AlertaService) {

    this.formGenero = new FormGroup({
      nombre: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
    this.cargarGeneros();
  }
  // Activar modo edición
  activarEdicion(genero: any) {
    this.generoEditando = genero.id_genero;
    this.nombreTemporal = genero.nombre;
  }

  // Guardar cambios
  guardarEdicion(genero: any) {
    if (this.nombreTemporal.trim()) {
      genero.nombre = this.nombreTemporal.trim();
      this.updateGenero(genero);
      this.cancelarEdicion();
    }
  }

  // Cancelar edición
  cancelarEdicion() {
    this.generoEditando = null;
    this.nombreTemporal = '';
  }

  // Actualizar en el backend
  updateGenero(genero: Generos) {
    console.log(genero.id_genero, '   ', genero.nombre);
    this.generoService.updateGenero(genero)
      .subscribe({
        next: () => {
          this.alerta.success('', 'Género actualizado correctamente');
        },
        error: () => {
          this.alerta.error('', 'Error al actualizar el género');
        }
      });
  }
  cargarGeneros(): void {
    this.generoService.getGeneros().subscribe({
      next: (data) => {
        this.generos = data;
        this.aplicarFiltro(); // Inicializa la lista filtrada
      }
    });

  }
  aplicarFiltro() {
    const termino = this.filtroGenero.toLowerCase().trim();

    this.generosFiltrados = this.generos.filter(g =>
      g.nombre.toLowerCase().includes(termino)
    );
    this.generosFiltrados = this.generosFiltrados.sort((a, b) => a.id_genero - b.id_genero);
  }

  totalGeneros(): number {
    return this.total = this.generos.length;
  }


  addGenero(): void {
    if (!this.formGenero.valid) {
      this.alerta.error("Formulario Inválido", "Ingrese un nombre");
      return;
    }

    const obj = this.formGenero.value as Generos;
    try {
      this.generoService.addGenero(obj).subscribe({
        next: () => {
          this.alerta.success("Género creado", "El género se guardó correctamente");
          this.formGenero.reset();
          this.cargarGeneros();
        },
        error: () => {
          this.alerta.error("Error", "Error al guardar el género");
        }
      });
    } catch (error) {
      this.alerta.error("Error", "Error al guardar el género");
    }
  }

  deleteGenero(id: number, nombre: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el género ' + nombre + ' permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.generoService.deleteGenero(id).subscribe({
          next: (res) => {
            Swal.fire('Eliminado', res.mensaje, 'success');
            this.cargarGeneros();
          },
          error: (err) => {
            const mensaje = err.error?.error || 'No se pudo eliminar el género.';
            Swal.fire('Error', mensaje, 'error');
          }
        });
      }
    });
  }
}
