import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PromocionService } from '@features/promotions/services/promocion.service';
import { Promocion } from '@core/models/promocion.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ImgbbService } from '@core/services/utils/imgbb.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-promociones',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './crear-promociones.component.html',
  styleUrl: './crear-promociones.component.css',
})
export class CreatePromocionComponent {
  promocionForm: FormGroup;
  tiposPromocion = ['Descuento', 'Multiplicador', 'Cupon', 'Publicitaria'];
  diasSemana = [
    'Lunes',
    'Martes',
    'Miercoles',
    'Jueves',
    'Viernes',
    'Sabado',
    'Domingo',
    'Todos',
  ];
  estados = ['Activo', 'Inactivo', 'Finalizado', 'Pendiente'];
  imagenSeleccionada!: File;
  imagenPreview: string = '';

  constructor(
    private fb: FormBuilder,
    private promocionService: PromocionService,
    public router: Router,
    private imgbbService: ImgbbService,
  ) {
    this.promocionForm = this.fb.group({
      imagen_url: [''],
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      tipo_promocion: ['Descuento', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      url_link: [''],
      estado: ['Activo', Validators.required],
      porcentaje_descuento: [null],
      nro_boletos: [null],
      codigo_cupon: [''],
      dia_valido: ['Todos'],
    });

    this.promocionForm.get('tipo_promocion')?.valueChanges.subscribe((val) => {
      this.updateValidators(val);
    });

    this.updateValidators('Descuento');
  }


updateValidators(tipo: string) {
    const porcentajeControl = this.promocionForm.get('porcentaje_descuento');
    const nroBoletosControl = this.promocionForm.get('nro_boletos');
    const codigoControl = this.promocionForm.get('codigo_cupon');
    const diaControl = this.promocionForm.get('dia_valido');

    [porcentajeControl, nroBoletosControl, codigoControl, diaControl].forEach(
      (control) => {
        control?.setValue(null);
        control?.clearValidators();
        control?.updateValueAndValidity();
      }
    );

    switch (tipo) {
      case 'Descuento':
        porcentajeControl?.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(100),
        ]);
        diaControl?.setValidators([Validators.required]);
        break;
      case 'Multiplicador':
        nroBoletosControl?.setValidators([
          Validators.required,
          Validators.min(2),
        ]);
        diaControl?.setValidators([Validators.required]);
        break;
      case 'Cupon':
        porcentajeControl?.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(100),
        ]);
        codigoControl?.setValidators([Validators.required]);
        break;
      case 'Publicitaria':
        // No necesita validadores adicionales
        break;
    }

    this.promocionForm.updateValueAndValidity();
  }

  async onSubmit() {
    this.promocionForm.markAllAsTouched();

    if (this.promocionForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor complete correctamente todos los campos requeridos.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    const promocion: Promocion = this.promocionForm.value;

    try {
      if (this.imagenSeleccionada) {
        const url = await this.imgbbService.subirImagen(this.imagenSeleccionada);
        promocion.imagen_url = url;
      }

      this.promocionService.createPromocion(promocion).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Promoción creada exitosamente',
            confirmButtonColor: '#3085d6',
          }).then(() => {
            this.resetForm();
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al guardar la promoción. Intente de nuevo.',
            confirmButtonColor: '#3085d6',
          });
          console.error('Error al guardar promoción:', err);
        },
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al subir la imagen. Intente de nuevo.',
        confirmButtonColor: '#3085d6',
      });
      console.error('Error al subir la imagen:', error);
    }
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.imagenSeleccionada = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  private resetForm(): void {
    this.promocionForm.reset({
      tipo_promocion: 'Descuento',
      estado: 'Activo',
      dia_valido: 'Todos',
    });
    this.imagenPreview = '';
    this.imagenSeleccionada = undefined!;
  }
}