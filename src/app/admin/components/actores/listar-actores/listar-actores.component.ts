import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActoresService } from '@features/movies';
import { PaisesService } from '@features/catalog';
import { CommonModule } from '@angular/common';
import { ActorCreateDTO, Actores } from '@core/models/actores.model';
import { AlertaService } from '@core/services';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-listar-actores',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './listar-actores.component.html',
  styleUrl: './listar-actores.component.css',
})
export class ListarActoresComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  formActor: FormGroup;
  actores: Actores[] = [];
  actoresFiltrados: Actores[] = [];
  paises: { id_pais: number; nombre: string }[] = [];
  filtroActores: string = '';
  actorEditando: number | null = null;
  nombreTemporal: string = '';
  apellidosTemporal: string = '';
  fechaNacimientoTemporal: string = '';
  nacionalidadTemporal: number | null = null;

  // Estados de carga
  isLoadingActores = true;
  isLoadingPaises = true;
  isSubmitting = false;
  isDeleting = false;
  isUpdating = false;

  // Propiedades para el dropdown con buscador - Formulario
  paisSearchTerm: string = '';
  filteredPaises: { id_pais: number; nombre: string }[] = [];
  showPaisesDropdown: boolean = false;

  // Propiedades para el dropdown con buscador - Edición
  paisEditSearchTerm: string = '';
  filteredPaisesEdit: { id_pais: number; nombre: string }[] = [];
  showPaisesEditDropdown: boolean = false;

  constructor(
    private fb: FormBuilder,
    private actorService: ActoresService,
    private paisService: PaisesService,
    private alerta: AlertaService
  ) {
    this.formActor = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      fecha_nacimiento: ['', Validators.required],
      id_nacionalidad: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.cargarPaises().then(() => {
      this.cargarActores();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarActores(): void {
    this.isLoadingActores = true;
    this.actorService
      .getActor()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.actores = data.map((actor) => ({
            ...actor,
            nombrePais: this.obtenerNombrePais(actor.id_nacionalidad),
            // Mostrar solo año, mes y día
            fecha_nacimiento: this.extraerFecha(actor.fecha_nacimiento),
          }));

          this.actoresFiltrados = [...this.actores];
          this.isLoadingActores = false;
        },
        error: () => {
          this.alerta.error('Error', 'No se pudieron cargar los actores');
          this.isLoadingActores = false;
        },
      });
  }

  // Agrega este método en tu componente:
  private extraerFecha(fecha: string | Date): string {
    if (!fecha) return '';
    if (typeof fecha === 'string') {
      // Si viene como '2025-07-02T00:00' o '2025-07-02T00:00:00.000Z'
      return fecha.split('T')[0];
    }
    if (fecha instanceof Date) {
      return fecha.toISOString().split('T')[0];
    }
    return '';
  }
  cargarPaises(): Promise<void> {
    this.isLoadingPaises = true;
    return new Promise((resolve, reject) => {
      this.paisService
        .getPais()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            // Ordenar alfabéticamente
            this.paises = data.sort((a, b) => a.nombre.localeCompare(b.nombre));
            this.filteredPaises = [...this.paises];
            this.filteredPaisesEdit = [...this.paises];
            this.isLoadingPaises = false;
            resolve();
          },
          error: () => {
            this.alerta.error('Error', 'No se pudieron cargar los países');
            this.isLoadingPaises = false;
            reject();
          },
        });
    });
  }

  totalActores(): number {
    return this.actores.length;
  }

  addActor(): void {
    if (this.formActor.valid) {
      this.isSubmitting = true;

      const localDateString: string = this.formActor.value.fecha_nacimiento; // 'YYYY-MM-DDTHH:mm'
      let fechaUTC: Date | null = null;
      if (localDateString) {
        const [year, month, day] = localDateString.split('-').map(Number);
        fechaUTC = new Date(Date.UTC(year, month - 1, day));
      }

      const formValue = this.formActor.value;
      const actorData: ActorCreateDTO = {
        ...formValue,
        fecha_nacimiento: fechaUTC!,
      };

      this.actorService
        .addActor(actorData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.alerta.success('Éxito', 'Actor agregado correctamente');
            this.cargarActores();
            this.resetForm();
            this.isSubmitting = false;
          },
          error: () => {
            this.alerta.error('Error', 'No se pudo agregar el actor');
            this.isSubmitting = false;
          },
        });
    } else {
      this.alerta.warning(
        'Advertencia',
        'Por favor complete todos los campos requeridos'
      );
    }
  }

  aplicarFiltro(): void {
    if (!this.filtroActores) {
      this.actoresFiltrados = [...this.actores];
      return;
    }

    const filtro = this.filtroActores.toLowerCase();
    this.actoresFiltrados = this.actores.filter(
      (actor) =>
        actor.nombre.toLowerCase().includes(filtro) ||
        actor.apellidos.toLowerCase().includes(filtro)
    );
  }

  activarEdicion(actor: Actores): void {
    this.actorEditando = actor.id_actor;
    this.nombreTemporal = actor.nombre;
    this.apellidosTemporal = actor.apellidos;
    this.fechaNacimientoTemporal = this.formatDateForInput(
      actor.fecha_nacimiento
    );
    this.nacionalidadTemporal = actor.id_nacionalidad;

    // Inicializar dropdown de edición
    const paisSeleccionado = this.paises.find(
      (p) => p.id_pais === actor.id_nacionalidad
    );
    this.paisEditSearchTerm = paisSeleccionado ? paisSeleccionado.nombre : '';
    this.filteredPaisesEdit = [...this.paises];
  }

  formatDateForInput(dateInput: Date | string): string {
    if (!dateInput) {
      return '';
    }

    let date: Date;
    if (typeof dateInput === 'string') {
      // Si es string ISO, verificar si contiene hora
      if (dateInput.includes('T')) {
        // Contiene hora, extraer fecha y hora
        const dateTimeOnly = dateInput.split('.')[0]; // Remover milisegundos si existen
        return dateTimeOnly;
      } else {
        // Solo fecha, agregar hora por defecto
        return dateInput + 'T00:00';
      }
    } else {
      date = dateInput;
    }

    if (isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  guardarEdicion(): void {
    if (!this.actorEditando) {
      this.alerta.error('Error', 'ID de actor inválido');
      return;
    }

    if (
      !this.nombreTemporal ||
      !this.apellidosTemporal ||
      !this.fechaNacimientoTemporal ||
      !this.nacionalidadTemporal
    ) {
      this.alerta.warning('Advertencia', 'Todos los campos son requeridos');
      return;
    }

    this.isUpdating = true;
    const actorActualizado = {
      nombre: this.nombreTemporal.trim(),
      apellidos: this.apellidosTemporal.trim(),
      fecha_nacimiento: new Date(this.fechaNacimientoTemporal).toISOString(),
      id_nacionalidad: this.nacionalidadTemporal,
    };

    this.actorService
      .updateActor(this.actorEditando, actorActualizado)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.alerta.success('Éxito', 'Actor actualizado correctamente');
          this.cargarActores();
          this.cancelarEdicion();
          this.isUpdating = false;
        },
        error: () => {
          this.alerta.error('Error', 'No se pudo actualizar el actor');
          this.isUpdating = false;
        },
      });
  }

  cancelarEdicion(): void {
    this.actorEditando = null;
    this.nombreTemporal = '';
    this.apellidosTemporal = '';
    this.fechaNacimientoTemporal = '';
    this.nacionalidadTemporal = null;
  }

  deleteActor(id: number, nombre: string): void {
    if (this.isDeleting) return; // Prevenir múltiples eliminaciones

    this.alerta
      .confirmacion(
        '¿Estás seguro?',
        `Esta acción eliminará al actor ${nombre} permanentemente`,
        'Sí, eliminar',
        'Cancelar'
      )
      .then((result: { isConfirmed: boolean }) => {
        if (result.isConfirmed) {
          this.isDeleting = true;
          this.actorService
            .deleteActor(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.alerta.success('Eliminado', 'El actor ha sido eliminado');
                this.cargarActores();
                this.isDeleting = false;
              },
              error: (err) => {
                const mensaje =
                  err?.error?.error || 'No se pudo eliminar el actor';
                this.alerta.error('Error', mensaje);
                this.isDeleting = false;
              },
            });
        }
      });
  }

  obtenerNombrePais(idPais: number | null): string {
    if (!idPais) return 'Desconocido';
    const pais = this.paises.find((p) => p.id_pais === idPais);
    return pais?.nombre || 'Desconocido';
  }

  /**
   * Verifica si hay operaciones de carga en progreso
   */
  isLoading(): boolean {
    return this.isLoadingActores || this.isLoadingPaises;
  }

  /**
   * Verifica si hay operaciones de escritura en progreso
   */
  isBusy(): boolean {
    return this.isSubmitting || this.isDeleting || this.isUpdating;
  }

  /**
   * Verifica si se pueden realizar operaciones de edición
   */
  canEdit(): boolean {
    return !this.isLoading() && !this.isBusy();
  }

  /**
   * Resetea el formulario y mantiene los valores por defecto
   */
  private resetForm(): void {
    this.formActor.reset({
      nombre: '',
      apellidos: '',
      fecha_nacimiento: '',
      id_nacionalidad: null,
    });

    // Marcar el formulario como pristine y untouched
    this.formActor.markAsPristine();
    this.formActor.markAsUntouched();

    // Resetear dropdown
    this.paisSearchTerm = '';
    this.filteredPaises = [...this.paises];
  }

  // Métodos para el dropdown con buscador - Formulario
  filterPaises(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredPaises = this.paises.filter((pais) =>
      pais.nombre.toLowerCase().includes(searchTerm)
    );
  }

  selectPais(pais: { id_pais: number; nombre: string }): void {
    this.formActor.get('id_nacionalidad')?.setValue(pais.id_pais);
    this.paisSearchTerm = pais.nombre;
    this.showPaisesDropdown = false;
  }

  togglePaisesDropdown(): void {
    this.showPaisesDropdown = !this.showPaisesDropdown;
    if (this.showPaisesDropdown) {
      this.filteredPaises = [...this.paises];
    }
  }

  hidePaisesDropdown(): void {
    setTimeout(() => (this.showPaisesDropdown = false), 200);
    this.filteredPaises = [...this.paises];
  }

  // Métodos para el dropdown con buscador - Edición
  filterPaisesEdit(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredPaisesEdit = this.paises.filter((pais) =>
      pais.nombre.toLowerCase().includes(searchTerm)
    );
  }

  selectPaisEdit(pais: { id_pais: number; nombre: string }): void {
    this.nacionalidadTemporal = pais.id_pais;
    this.paisEditSearchTerm = pais.nombre;
    this.showPaisesEditDropdown = false;
  }

  togglePaisesEditDropdown(): void {
    this.showPaisesEditDropdown = !this.showPaisesEditDropdown;
    if (this.showPaisesEditDropdown) {
      this.filteredPaisesEdit = [...this.paises];
    }
  }

  hidePaisesEditDropdown(): void {
    setTimeout(() => (this.showPaisesEditDropdown = false), 200);
    this.filteredPaisesEdit = [...this.paises];
  }
}
