import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PromocionService } from '../../../../services/promocion.service';
import { Promocion } from '../../../models/promocion.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ImgbbService } from '../../../../services/imgbb.service';
import { AlertComponent } from '../../../../shared/alert/alert.component';
import { Subscription } from 'rxjs';
import { TemaService } from '../../../../cliente/features/movies/services/tema.service';

@Component({
  selector: 'app-crear-promociones',
  imports: [ReactiveFormsModule, CommonModule, AlertComponent],
  templateUrl: './crear-promociones.component.html',
  styleUrl: './crear-promociones.component.css',
})
export class CreatePromocionComponent {
  promocionForm: FormGroup;
  tiposPromocion = ['Descuento', 'Multiplicador', 'Cupon'];
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

  showAlert = false;
  alertMessage = '';
  alertTheme: 'light' | 'dark' = 'light';
  alertType: 'success' | 'error' | 'warning' | 'info' = 'success';
  private temaSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private promocionService: PromocionService,
    public router: Router,
    private imgbbService: ImgbbService,
    private temaService: TemaService
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

  ngOnInit(): void {
    this.temaSubscription = this.temaService.modoOscuro$.subscribe(
      (modoOscuro) => {
        this.alertTheme = modoOscuro ? 'dark' : 'light';
      }
    );
  }

  ngOnDestroy(): void {
    if (this.temaSubscription) {
      this.temaSubscription.unsubscribe();
    }
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
    }

    this.promocionForm.updateValueAndValidity();
  }

  async onSubmit() {
    console.log(
      '🔔 onSubmit invocado. FormGroup válido:',
      this.promocionForm.valid
    );
    this.promocionForm.markAllAsTouched();

    if (this.promocionForm.invalid) {
      this.showAlertMessage(
        'Por favor complete correctamente todos los campos requeridos.',
        'warning'
      );
      return;
    }


    const promocion: Promocion = this.promocionForm.value;
    console.log('Formulario válido, datos actuales:', promocion);

    try {
      if (this.imagenSeleccionada) {
        console.log('Subiendo imagen a imgbb...');
        const url = await this.imgbbService.subirImagen(
          this.imagenSeleccionada
        );
        console.log('URL recibida de imgbb:', url);
        promocion.imagen_url = url;
      } else {
        console.log('No hay imagen seleccionada');
      }
      this.promocionService.createPromocion(promocion).subscribe({
        next: () => {
          console.log('Promoción enviada con éxito');
          this.showAlertMessage('¡Promoción creada exitosamente!', 'success');
          this.resetForm();
        },
        error: (err) => {
          console.error('Error al guardar promoción:', err);
          this.showAlertMessage(
            'Error al guardar la promoción. Intente de nuevo.',
            'error'
          );
        },
      });
    } catch (error) {
      console.error('Error al subir la imagen:', error); // <-- AQUÍ
    }
    
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.imagenSeleccionada = file;
      console.log('Imagen seleccionada:', file); // <-- AQUÍ

      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result as string;
        console.log('Preview cargada'); // <-- Y AQUÍ
      };
      reader.readAsDataURL(file);
    }
  }

  private showAlertMessage(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info'
  ) {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
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
