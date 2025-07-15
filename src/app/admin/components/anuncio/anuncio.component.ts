import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AnuncioService } from '@core/services';
import { Anuncio } from '@core/models/anuncio.model';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from '../../pipes/pipe';
import { AlertaService } from '@core/services';

@Component({
  selector: 'app-anuncio',
  imports: [CommonModule, ReactiveFormsModule, TruncatePipe],
  templateUrl: './anuncio.component.html',
  styleUrl: './anuncio.component.css'
})
export class AnuncioComponent implements OnInit, OnDestroy {
  anuncioForm: FormGroup;
  anuncios: Anuncio[] = [];
  anuncioActivo: Anuncio | null = null;
  private intervalId: any; // Para el timer de verificación automática

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

    // Configurar verificación automática cada 60 segundos (1 minuto)
    this.intervalId = setInterval(() => {
      this.verificarAnunciosExpirados();
    }, 60000); // 60000 ms = 1 minuto
  }

  ngOnDestroy(): void {
    // Limpiar el interval cuando el componente se destruye
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  cargarAnuncios(): void {
    this.anuncioService.getAnuncios().subscribe({
      next: (anuncios) => {
        this.anuncios = anuncios;

        // Verificar y actualizar anuncios expirados automáticamente
        this.verificarAnunciosExpirados();

        this.anuncioActivo = anuncios.find(a => a.estado === 'Activo') || null;
      },
      error: () => {
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
          this.resetForm();
        },
        error: () => {
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
      error: () => {
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
          error: () => {
            this.alerta.error('Error', 'No se pudo eliminar el anuncio');
          }
        });
      }
    });
  }

  private resetForm(): void {
    this.anuncioForm.reset({
      color_inicio: '#ffd966',
      color_fin: '#ffb347',
      estado: 'Inactivo'
    });
  }

  // Función para verificar y desactivar anuncios expirados automáticamente
  private verificarAnunciosExpirados(): void {
    const ahora = new Date();

    // Buscar anuncios activos que hayan expirado
    const anunciosParaDesactivar = this.anuncios.filter(anuncio => {
      if (anuncio.estado === 'Activo' && anuncio.fecha_fin) {
        // Obtener fecha fin como string
        let fechaFinString: string;

        if (typeof anuncio.fecha_fin === 'string') {
          fechaFinString = anuncio.fecha_fin;
        } else {
          fechaFinString = (anuncio.fecha_fin as Date).toISOString();
        }

        // Trabajar directamente con strings para evitar conversiones de zona horaria
        const fechaFinISO = fechaFinString.replace('Z', ''); // Quitar la Z de UTC

        // Crear string de ahora en formato similar (sin Z para comparación local)
        const year = ahora.getFullYear();
        const month = String(ahora.getMonth() + 1).padStart(2, '0');
        const day = String(ahora.getDate()).padStart(2, '0');
        const hours = String(ahora.getHours()).padStart(2, '0');
        const minutes = String(ahora.getMinutes()).padStart(2, '0');
        const seconds = String(ahora.getSeconds()).padStart(2, '0');
        const ahoraISO = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000`;

        // Comparar strings directamente
        return fechaFinISO <= ahoraISO;
      }
      return false;
    });

    // Desactivar cada anuncio expirado
    anunciosParaDesactivar.forEach(anuncio => {
      if (anuncio.id) {
        this.anuncioService.updateEstadoAnuncio(anuncio.id, 'Inactivo').subscribe({
          next: () => {
            // Actualizar el estado local
            const index = this.anuncios.findIndex(a => a.id === anuncio.id);
            if (index !== -1) {
              this.anuncios[index].estado = 'Inactivo';
            }
            // Actualizar anuncio activo
            this.anuncioActivo = this.anuncios.find(a => a.estado === 'Activo') || null;
          },
          error: (error) => {
            console.error(`Error al desactivar anuncio ${anuncio.id}:`, error);
          }
        });
      }
    });
  }

  // Función para mostrar fecha y hora de manera legible sin problemas de zona horaria
  formatDateTimeDisplay(dateInput: Date | string): string {
    if (!dateInput) {
      return '';
    }

    let dateString: string;

    if (typeof dateInput === 'string') {
      // Si es string, trabajar directamente con el string para evitar conversiones de zona horaria
      dateString = dateInput;
    } else {
      // Si es Date, convertir a ISO string
      dateString = dateInput.toISOString();
    }

    // Extraer componentes directamente del string ISO
    // Formato esperado: "YYYY-MM-DDTHH:mm:ss.sssZ" o "YYYY-MM-DDTHH:mm:ss"
    const datePart = dateString.split('T')[0]; // "YYYY-MM-DD"
    const timePart = dateString.split('T')[1]?.split('.')[0] || '00:00:00'; // "HH:mm:ss"

    if (!datePart || !timePart) {
      return '';
    }

    const [year, month, day] = datePart.split('-');
    const [hours, minutes] = timePart.split(':');

    // Validar que todos los componentes existan
    if (!year || !month || !day || !hours || !minutes) {
      return '';
    }

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
}