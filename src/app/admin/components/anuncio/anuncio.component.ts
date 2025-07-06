import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AnuncioService } from '../../../services/anuncio.service';
import { Anuncio } from '../../models/anuncio.model';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from '../../pipes/pipe';
import { AlertaService } from '../../../services/alerta.service';

@Component({
  selector: 'app-anuncio',
  imports: [CommonModule, ReactiveFormsModule, TruncatePipe],
  templateUrl: './anuncio.component.html',
  styleUrl: './anuncio.component.css'
})
export class AnuncioComponent implements OnInit {
  anuncioForm: FormGroup;
  anuncios: Anuncio[] = [];
  anuncioActivo: Anuncio | null = null;

  constructor(
    private fb: FormBuilder,
    private anuncioService: AnuncioService,
    private alerta: AlertaService
  ) {
    this.anuncioForm = this.fb.group({
      mensaje: ['', Validators.required],
      color_inicio: ['#ffd966', Validators.required],
      color_fin: ['#ffb347', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      estado: ['Inactivo', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarAnuncios();
  }

  cargarAnuncios(): void {
    this.anuncioService.getAnuncios().subscribe({
      next: (anuncios) => {
        this.anuncios = anuncios;
        this.anuncioActivo = anuncios.find(a => a.estado === 'Activo') || null;
      },
      error: (err) => {
        console.error('Error cargando anuncios', err);
        this.alerta.error('Error', 'No se pudieron cargar los anuncios');
      }
    });
  }

  onSubmit(): void {
    if (this.anuncioForm.valid) {
      const nuevoAnuncio: Anuncio = this.anuncioForm.value;
      
      this.anuncioService.createAnuncio(nuevoAnuncio).subscribe({
        next: () => {
          this.alerta.success('Éxito', 'Anuncio creado correctamente');
          this.cargarAnuncios();
          this.anuncioForm.reset({
            color_inicio: '#ffd966',
            color_fin: '#ffb347',
            estado: 'Inactivo'
          });
        },
        error: (err) => {
          console.error('Error creando anuncio', err);
          this.alerta.error('Error', 'No se pudo crear el anuncio');
        }
      });
    } else {
      this.alerta.warning('Formulario incompleto', 'Por favor complete todos los campos requeridos');
    }
  }

  cambiarEstado(id: number, nuevoEstado: 'Activo' | 'Inactivo'): void {
    this.anuncioService.updateEstadoAnuncio(id, nuevoEstado).subscribe({
      next: () => {
        this.alerta.success('Éxito', `Anuncio ${nuevoEstado.toLowerCase()} correctamente`);
        this.cargarAnuncios();
      },
      error: (err) => {
        console.error('Error actualizando estado', err);
        this.alerta.error('Error', 'No se pudo cambiar el estado del anuncio');
      }
    });
  }

  eliminarAnuncio(id: number): void {
    this.alerta.confirmacion(
      '¿Estás seguro?', 
      '¿Quieres eliminar este anuncio? Esta acción no se puede deshacer.',
      'Sí, eliminar',
      'Cancelar'
    ).then((result: { isConfirmed: boolean }) => {
      if (result.isConfirmed) {
        this.anuncioService.deleteAnuncio(id).subscribe({
          next: () => {
            this.alerta.success('Eliminado', 'El anuncio ha sido eliminado correctamente');
            this.cargarAnuncios();
          },
          error: (err) => {
            console.error('Error eliminando anuncio', err);
            this.alerta.error('Error', 'No se pudo eliminar el anuncio');
          }
        });
      }
    });
  }
}