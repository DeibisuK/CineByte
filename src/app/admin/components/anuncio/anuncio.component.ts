import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AnuncioService } from '../../../services/anuncio.service';
import { Anuncio } from '../../models/anuncio.model';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from '../../pipes/pipe';

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
    private anuncioService: AnuncioService
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
      error: (err) => console.error('Error cargando anuncios', err)
    });
  }

  onSubmit(): void {
    if (this.anuncioForm.valid) {
      const nuevoAnuncio: Anuncio = this.anuncioForm.value;
      
      this.anuncioService.createAnuncio(nuevoAnuncio).subscribe({
        next: () => {
          this.cargarAnuncios();
          this.anuncioForm.reset({
            color_inicio: '#ffd966',
            color_fin: '#ffb347',
            estado: 'Inactivo'
          });
        },
        error: (err) => console.error('Error creando anuncio', err)
      });
    }
  }

  cambiarEstado(id: number, nuevoEstado: 'Activo' | 'Inactivo'): void {
    this.anuncioService.updateEstadoAnuncio(id, nuevoEstado).subscribe({
      next: () => this.cargarAnuncios(),
      error: (err) => console.error('Error actualizando estado', err)
    });
  }

  eliminarAnuncio(id: number): void {
    if (confirm('¿Estás seguro de eliminar este anuncio?')) {
      this.anuncioService.deleteAnuncio(id).subscribe({
        next: () => this.cargarAnuncios(),
        error: (err) => console.error('Error eliminando anuncio', err)
      });
    }
  }
}