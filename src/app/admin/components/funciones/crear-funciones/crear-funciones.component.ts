import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { Pelicula } from '@core/models/pelicula.model';
import { Sede, SedeService } from '@features/venues';
import { Idiomas } from '@core/models/idiomas.model';
import { FuncionesService } from '@features/movies/services/funciones.service';
import { PeliculaService } from '@features/movies/services/pelicula.service';
import { IdiomasService } from '@features/catalog';
import { SedeSala } from '@core/models/sede_salas.model';
import { SedeSalasService } from '@features/venues/services/sede-salas.service';
import { Funciones } from '@core/models/funciones.model';
import { AlertaService } from '@core/services';

@Component({
  selector: 'app-crear-funciones',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './crear-funciones.component.html',
  styleUrl: './crear-funciones.component.css'
})
export class CrearFuncionesComponent implements OnInit, OnDestroy {
  private readonly DROPDOWN_DELAY = 200;
  private destroy$ = new Subject<void>();
  
  funcionesForm: FormGroup;
  
  // Datos originales
  peliculas: Pelicula[] = [];
  sedes: Sede[] = [];
  salas: SedeSala[] = [];
  idiomas: Idiomas[] = []; 
  idiomasOriginales: Idiomas[] = []; // Para mantener los datos originales
  idiomasPelicula: number[] = []; // Array de IDs de idiomas, no objetos 

  // Datos filtrados
  filteredPeliculas: Pelicula[] = [];
  filteredSedes: Sede[] = [];
  filteredSalas: SedeSala[] = [];

  // Estados de dropdowns
  showPeliculasDropdown = false;
  showSedesDropdown = false;
  showSalasDropdown = false;

  // IDs seleccionados
  selectedPeliculaId: number | null = null;
  selectedSedeId: number | null = null;
  selectedSalaId: number | null = null;
  
  // Estados de UI
  isSubmitting = false;
  isLoadingInitialData = true;
  isLoadingSalas = false;
  isLoadingIdiomas = false;
  
  // Opciones para dropdown de estado
  estadosDisponibles = [
    { value: 'activa', label: 'Activa' },
    { value: 'suspendida', label: 'Suspendida' },
    { value: 'finalizada', label: 'Finalizada' }
  ];
  
  // Fecha calculada
  fechaHoraFin: Date | null = null;
  constructor(
    private fb: FormBuilder,
    private funcionesService: FuncionesService,
    private peliculasService: PeliculaService,
    private sedesService: SedeService,
    private sedesSalasService: SedeSalasService,
    private idiomasService: IdiomasService,
    private alerta: AlertaService
  ) {
    this.funcionesForm = this.fb.group({
      pelicula_search: ['', Validators.required],
      sede_search: ['', Validators.required],
      sala_search: ['', Validators.required],
      fecha_hora_inicio: ['', [Validators.required, this.fechaFuturaValidator]],
      precio: ['', [Validators.required, Validators.min(0.01), Validators.max(999.99)]],
      id_idioma: ['', Validators.required],
      trailer_url: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/)]],
      estado: ['', Validators.required],
      id_pelicula: [''],
      id_sede: [''],
      id_sala: ['']
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupFormListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFormListeners(): void {
    // Escuchar cambios en la fecha de inicio para recalcular la fecha de fin
    this.funcionesForm.get('fecha_hora_inicio')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.calculateFechaFin();
      });
  }

  private loadInitialData(): void {
    this.isLoadingInitialData = true;
    forkJoin({
      peliculas: this.peliculasService.getPeliculas(),
      sedes: this.sedesService.getSedes(),
      idiomas: this.idiomasService.getIdiomas()
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ peliculas, sedes, idiomas }) => {
        this.peliculas = this.filteredPeliculas = peliculas;
        this.sedes = this.filteredSedes = sedes;
        this.idiomas = this.idiomasOriginales = idiomas;
        this.isLoadingInitialData = false;
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
        this.alerta.error('Error', 'Error al cargar los datos iniciales.');
        this.isLoadingInitialData = false;
      }
    });
  }
  // Event handlers con tipos específicos
  filterPeliculas(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value.toLowerCase();
    this.filteredPeliculas = this.peliculas.filter(pelicula =>
      pelicula.titulo.toLowerCase().includes(query)
    );
    this.showPeliculasDropdown = true;
  }

  selectPelicula(pelicula: Pelicula): void {
    this.selectedPeliculaId = pelicula.id_pelicula;
    this.getIdiomasPorPelicula(pelicula);
    this.funcionesForm.patchValue({
      pelicula_search: pelicula.titulo,
      id_pelicula: pelicula.id_pelicula
    });
    this.showPeliculasDropdown = false;
    
    // Calcular fecha de fin si ya hay fecha de inicio
    this.calculateFechaFin();
  }

  togglePeliculasDropdown(): void {
    this.showPeliculasDropdown = !this.showPeliculasDropdown;
    if (this.showPeliculasDropdown) {
      this.filteredPeliculas = this.peliculas;
    }
  }

  hidePeliculasDropdown(): void {
    setTimeout(() => {
      this.showPeliculasDropdown = false;
    }, this.DROPDOWN_DELAY);
  }

  // Métodos para Sedes
  filterSedes(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value.toLowerCase();
    this.filteredSedes = this.sedes.filter(sede =>
      sede.nombre.toLowerCase().includes(query)
    );
    this.showSedesDropdown = true;
  }

  selectSede(sede: Sede): void {
    this.selectedSedeId = sede.id_sede ?? null;
    this.funcionesForm.patchValue({
      sede_search: sede.nombre,
      id_sede: sede.id_sede,
      sala_search: '', // Limpiar sala seleccionada
      id_sala: ''
    });
    this.selectedSalaId = null;
    this.showSedesDropdown = false;
    this.loadSalasBySede(sede.id_sede ?? 0);
  }

  toggleSedesDropdown(): void {
    this.showSedesDropdown = !this.showSedesDropdown;
    if (this.showSedesDropdown) {
      this.filteredSedes = this.sedes;
    }
  }

  hideSedesDropdown(): void {
    setTimeout(() => {
      this.showSedesDropdown = false;
    }, this.DROPDOWN_DELAY);
  }

  // Métodos para Salas
  loadSalasBySede(sedeId: number): void {
    this.isLoadingSalas = true;
    this.sedesSalasService.getSalasBySede(sedeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (salas) => {
          this.salas = this.filteredSalas = salas;
          this.isLoadingSalas = false;
        },
        error: (error) => {
          console.error('Error loading salas:', error);
          this.alerta.error('Error', 'Error al cargar las salas.');
          this.isLoadingSalas = false;
        }
      });
  }

  filterSalas(event: Event): void {
    if (!this.selectedSedeId) return;

    const target = event.target as HTMLInputElement;
    const query = target.value.toLowerCase();
    
    // Optimización: solo filtrar si hay query, sino mostrar todas las salas de la sede
    if (query.trim()) {
      this.filteredSalas = this.salas.filter(sala => 
        sala.id_sede === this.selectedSedeId && 
        sala.nombre.toLowerCase().includes(query)
      );
    } else {
      this.filteredSalas = this.salas.filter(sala => sala.id_sede === this.selectedSedeId);
    }
    this.showSalasDropdown = true;
  }

  selectSala(sala: SedeSala): void {
    this.selectedSalaId = sala.id_sala ?? null;
    this.funcionesForm.patchValue({
      sala_search: sala.nombre,
      id_sala: sala.id_sala
    });
    this.showSalasDropdown = false;
  }

  toggleSalasDropdown(): void {
    if (!this.selectedSedeId) return;
    this.showSalasDropdown = !this.showSalasDropdown;
    if (this.showSalasDropdown) {
      this.loadSalasBySede(this.selectedSedeId);
    }
  }

  hideSalasDropdown(): void {
    setTimeout(() => {
      this.showSalasDropdown = false;
    }, this.DROPDOWN_DELAY);
  }

  onSubmit(): void {
    if (this.funcionesForm.valid && this.areIdsSelected() && this.fechaHoraFin) {
      this.isSubmitting = true;

      // Validación adicional del precio
      const precioValue = this.funcionesForm.value.precio;
      if (!precioValue || isNaN(Number(precioValue)) || Number(precioValue) <= 0) {
        this.alerta.error('Error', 'El precio debe ser un número válido mayor a 0.');
        this.isSubmitting = false;
        return;
      }

      // Convertir fecha_hora_inicio (string local) a Date UTC
      const localDateString: string = this.funcionesForm.value.fecha_hora_inicio; // 'YYYY-MM-DDTHH:mm'
      let fechaUTC: Date | null = null;
      if (localDateString) {
        const [date, time] = localDateString.split('T');
        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = time.split(':').map(Number);
        fechaUTC = new Date(Date.UTC(year, month - 1, day, hour, minute));
      }

      // Calcular fecha_hora_fin en UTC (sumando duración a la fecha UTC)
      let fechaFinUTC: Date | null = null;
      if (fechaUTC && this.selectedPeliculaId) {
        const peliculaSeleccionada = this.peliculas.find(p => p.id_pelicula === this.selectedPeliculaId);
        if (peliculaSeleccionada?.duracion_minutos) {
          fechaFinUTC = new Date(fechaUTC.getTime() + peliculaSeleccionada.duracion_minutos * 60000);
        }
      }

      const formData: Funciones = {
        id_funcion: 0, // El backend lo generará
        id_pelicula: this.selectedPeliculaId!,
        id_sala: this.selectedSalaId!,
        fecha_hora_inicio: fechaUTC!,
        fecha_hora_fin: fechaFinUTC || this.fechaHoraFin!,
        precio_funcion: Number(precioValue),
        id_idioma: Number(this.funcionesForm.value.id_idioma),
        trailer_url: this.funcionesForm.value.trailer_url.trim(),
        estado: this.funcionesForm.value.estado
      };

      this.funcionesService.addFuncion(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.alerta.successRoute('Éxito', 'Función creada exitosamente!', 'funciones/list');
            this.limpiarFormulario();
          },
          error: (err) => {
            console.error('Error creating function:', err);
            const mensaje = err.error?.message || 'Error al crear la función.';
            this.alerta.error('Error', mensaje);
            this.isSubmitting = false;
          }
        });
    } else {
      this.markFormGroupTouched();
      this.alerta.warning('Formulario incompleto', 'Por favor, completa todos los campos requeridos correctamente.');
    }
  }

  private areIdsSelected(): boolean {
    return this.selectedPeliculaId !== null && 
           this.selectedSedeId !== null && 
           this.selectedSalaId !== null;
  }

  areFormReady(): boolean {
    return this.areIdsSelected() && this.idiomas.length > 0;
  }

  // Método para calcular la fecha de fin basada en la fecha de inicio y duración de la película
  private calculateFechaFin(): void {
    const fechaInicio = this.funcionesForm.get('fecha_hora_inicio')?.value;
    const peliculaSeleccionada = this.peliculas.find(p => p.id_pelicula === this.selectedPeliculaId);
    
    if (fechaInicio && peliculaSeleccionada?.duracion_minutos) {
      const fechaInicioDate = new Date(fechaInicio);
      const fechaFinDate = new Date(fechaInicioDate.getTime() + (peliculaSeleccionada.duracion_minutos * 60000));
      this.fechaHoraFin = fechaFinDate;
    } else {
      this.fechaHoraFin = null;
    }
  }

  limpiarFormulario(): void {
    this.funcionesForm.reset();
    this.funcionesForm.patchValue({ estado: 'activo' }); // Restaurar valor por defecto
    this.selectedPeliculaId = null;
    this.selectedSedeId = null;
    this.selectedSalaId = null;
    this.fechaHoraFin = null;
    this.filteredPeliculas = this.peliculas;
    this.filteredSedes = this.sedes;
    this.filteredSalas = [];
    this.idiomas = [...this.idiomasOriginales]; // Restaurar idiomas originales
    this.isSubmitting = false;
    
    // Cerrar todos los dropdowns
    this.showPeliculasDropdown = false;
    this.showSedesDropdown = false;
    this.showSalasDropdown = false;
  }

  private getIdiomasPorPelicula(pelicula: Pelicula): void {
    this.isLoadingIdiomas = true;
    this.peliculasService.getIdiomasByPeliculaId(pelicula.id_pelicula)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (idiomasPelicula) => {
          // La API retorna un array de números directamente [10, 11]
          this.idiomasPelicula = idiomasPelicula;
          
          // Filtrar idiomas disponibles para esta película
          this.idiomas = this.idiomasOriginales.filter(idioma => 
            idiomasPelicula.includes(idioma.id_idioma)
          );
          
          // Reset del idioma seleccionado si no está disponible para esta película
          const currentIdiomaId = this.funcionesForm.get('id_idioma')?.value;
          if (currentIdiomaId && !idiomasPelicula.includes(Number(currentIdiomaId))) {
            this.funcionesForm.patchValue({ id_idioma: '' });
          }
          
          this.isLoadingIdiomas = false;
        },
        error: (error) => {
          console.error('Error loading idiomas for pelicula:', error);
          this.alerta.error('Error', 'Error al cargar los idiomas de la película.');
          this.isLoadingIdiomas = false;
        }
      });
  }

  // Validador personalizado para fechas futuras
  private fechaFuturaValidator(control: any): {[key: string]: any} | null {
    if (!control.value) return null;
    
    const fechaSeleccionada = new Date(control.value);
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0); // Ignorar la hora para la comparación
    
    return fechaSeleccionada >= fechaActual ? null : { fechaPasada: true };
  }

  // Marcar todos los campos como tocados para mostrar errores
  private markFormGroupTouched(): void {
    Object.keys(this.funcionesForm.controls).forEach(key => {
      const control = this.funcionesForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getter para verificar si un campo específico tiene errores
  hasFieldError(fieldName: string): boolean {
    const field = this.funcionesForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Getter para obtener el mensaje de error de un campo
  getFieldError(fieldName: string): string {
    const field = this.funcionesForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['min']) return 'El valor debe ser mayor a 0';
      if (field.errors['max']) return 'El valor es demasiado alto';
      if (field.errors['pattern']) return 'URL de YouTube inválida';
      if (field.errors['fechaPasada']) return 'La fecha debe ser futura';
    }
    return '';
  }

  // Método opcional: Verificar conflictos de horarios (implementar según necesidad)
  private checkHorarioConflicts(): void {
    if (this.selectedSalaId && this.funcionesForm.get('fecha_hora_inicio')?.value && this.fechaHoraFin) {
      // Aquí puedes implementar una validación para verificar si ya existe una función
      // en esa sala durante ese horario
      // this.funcionesService.checkConflicts(salaId, fechaInicio, fechaFin).subscribe(...)
    }
  }
}