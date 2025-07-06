import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PromocionService } from '../../../../services/promocion.service';
import { Promocion } from '../../../models/promocion.model';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ImgbbService } from '../../../../services/imgbb.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-promociones',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './editar-promociones.component.html',
  styleUrl: './editar-promociones.component.css',
})
export class EditarPromocionComponent implements OnInit {
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
  imagenActual: string = '';
  promocionId!: number;
  imagenEliminada: boolean = false;

  constructor(
    private fb: FormBuilder,
    private promocionService: PromocionService,
    public router: Router,
    private imgbbService: ImgbbService,
    private route: ActivatedRoute
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
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.promocionId = +params['id'];
      this.cargarPromocion(this.promocionId);
    });
  }

  cargarPromocion(id: number): void {
    this.promocionService.getPromocionById(id).subscribe({
      next: (promocion) => {
        this.imagenActual = promocion.imagen_url || '';
        this.promocionForm.patchValue({
          ...promocion,
          fecha_inicio: this.formatDateForInput(
            promocion.fecha_inicio as string
          ),
          fecha_fin: this.formatDateForInput(promocion.fecha_fin as string),
        });
        this.updateValidators(promocion.tipo_promocion);
      },
      error: (err) => {
        console.error('Error al cargar promoción:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la promoción',
          confirmButtonColor: '#3085d6',
        }).then(() => {
          this.router.navigate(['/admin/promociones/list']);
        });
      },
    });
  }

  formatDateForInput(date: string | Date): string {
    if (typeof date === 'string' && date.includes('T')) {
      return date.split('T')[0];
    }

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  }

  updateValidators(tipo: string) {
    const porcentajeControl = this.promocionForm.get('porcentaje_descuento');
    const nroBoletosControl = this.promocionForm.get('nro_boletos');
    const codigoControl = this.promocionForm.get('codigo_cupon');
    const diaControl = this.promocionForm.get('dia_valido');

    [porcentajeControl, nroBoletosControl, codigoControl, diaControl].forEach(
      (control) => {
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

    const promocion: Promocion = {
      ...this.promocionForm.value,
      id_promo: this.promocionId,
    };

    try {
      // Si hay una nueva imagen, subirla
      if (this.imagenSeleccionada) {
        const url = await this.imgbbService.subirImagen(
          this.imagenSeleccionada
        );
        promocion.imagen_url = url;
      } else if (this.imagenEliminada) {
        promocion.imagen_url = '';
      }

      this.promocionService.updatePromocion(promocion).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Promoción actualizada exitosamente',
            confirmButtonColor: '#3085d6',
          }).then(() => {
            this.router.navigate(['/admin/promociones/list']);
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al actualizar la promoción. Intente de nuevo.',
            confirmButtonColor: '#3085d6',
          });
          console.error('Error al actualizar promoción:', err);
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
      this.imagenEliminada = false;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.imagenActual = '';
    this.imagenPreview = '';
    this.imagenSeleccionada = null!;
    this.imagenEliminada = true;
    this.promocionForm.patchValue({ imagen_url: '' });
  }
}
