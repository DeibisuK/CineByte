import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Pelicula } from '../../../models/pelicula.model';
import { Sede, SedeService } from '../../../../services/sede.service';
import { Idiomas } from '../../../models/idiomas.model';
import { FuncionesService } from '../../../../services/funciones.service';
import { PeliculaService } from '../../../../services/pelicula.service';
import { IdiomasService } from '../../../../services/idiomas.service';
import { SedeSala } from '../../../models/sede_salas.model';
import { SedeSalasService } from '../../../../services/sede-salas.service';
import { Funciones } from '../../../models/funciones.model';
import { AlertaService } from '../../../../services/alerta.service';

@Component({
  selector: 'app-editar-funciones',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './editar-funciones.component.html',
  styleUrl: './editar-funciones.component.css'
})
export class EditarFuncionesComponent implements OnInit, OnDestroy {
  private readonly DROPDOWN_DELAY = 200;
  private destroy$ = new Subject<void>();
  
  funcionesForm: FormGroup;
  funcionId: number = 0;
  funcionOriginal: Funciones | null = null;
  
  // Datos originales
  peliculas: Pelicula[] = [];
  sedes: Sede[] = [];
  salas: SedeSala[] = [];
  idiomas: Idiomas[] = []; 
  idiomasOriginales: Idiomas[] = [];
  idiomasPelicula: number[] = [];

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
  isLoadingFunction = true;
  
  // Opciones para dropdown de estado
  estadosDisponibles = [
    { value: 'activa', label: 'Activa' },
    { value: 'suspendida', label: 'Suspendida' },
    { value: 'cancelada', label: 'Cancelada' }
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
    private alerta: AlertaService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.funcionesForm = this.fb.group({
      pelicula_search: ['', Validators.required],
      sede_search: ['', Validators.required],
      sala_search: ['', Validators.required],
      fecha_hora_inicio: ['', [Validators.required, this.fechaFuturaValidator]],
      precio: ['', [Validators.required, Validators.min(0.01), Validators.max(999.99)]],
      id_idioma: ['', Validators.required],
      trailer_url: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/)]],
      estado: ['activo', Validators.required],
      id_pelicula: [''],
      id_sede: [''],
      id_sala: ['']
    });
  }

  ngOnInit(): void {
    // Obtener el ID de la función desde la ruta
    const idParam = this.route.snapshot.paramMap.get('id');
    this.funcionId = idParam ? parseInt(idParam) : 0;

    if (this.funcionId && this.funcionId > 0) {
      this.setupFormListeners();
      this.loadInitialData();
    } else {
      this.alerta.error('Error', 'ID de función no válido');
      this.router.navigate(['/admin/funciones/list']);
    }
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
        
        // Ahora que los datos iniciales están cargados, cargar la función a editar
        this.loadFuncionToEdit();
        
        // Si ya tenemos una función cargada, actualizar el campo de búsqueda de película
        this.updatePeliculaSearchField();
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
        this.alerta.error('Error', 'Error al cargar los datos iniciales.');
        this.isLoadingInitialData = false;
      }
    });
  }

  private loadFuncionToEdit(): void {
    this.isLoadingFunction = true;
    this.funcionesService.getFuncionById(this.funcionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (funcion) => {
          this.funcionOriginal = funcion;
          this.populateForm(funcion);
          this.isLoadingFunction = false;
        },
        error: (error) => {
          console.error('Error loading funcion:', error);
          this.alerta.error('Error', 'No se pudo cargar la función a editar.');
          this.router.navigate(['/admin/funciones/list']);
        }
      });
  }

  private populateForm(funcion: Funciones): void {    
    // Buscar la película correspondiente
    const pelicula = this.peliculas.find(p => p.id_pelicula === funcion.id_pelicula);
    
    if (pelicula) {
      this.selectPelicula(pelicula);
    } else {
      console.warn('Película no encontrada para id:', funcion.id_pelicula);
      // Si no se encuentra la película, al menos establecer el ID
      this.selectedPeliculaId = funcion.id_pelicula;
      this.funcionesForm.patchValue({
        id_pelicula: funcion.id_pelicula
      });
    }
    
    // Para encontrar la sede, usar el servicio que me dice a qué sedes pertenece la sala
    this.sedesSalasService.getSedesBySala(funcion.id_sala)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sedesSalas: SedeSala[]) => {
          if (sedesSalas.length > 0) {
            const sedeId = sedesSalas[0].id_sede;
            const sede = this.sedes.find(s => s.id_sede === sedeId);
            if (sede) {
              this.selectSede(sede);
              
              // Después de cargar las salas, seleccionar la sala actual
              setTimeout(() => {
                const salaActual = this.salas.find(s => s.id_sala === funcion.id_sala);
                if (salaActual) {
                  this.selectSala(salaActual);
                }
              }, 500);
            }
          }
        },
        error: (error: any) => {
          console.error('Error loading sede for sala:', error);
        }
      });

    // Formatear fechas para el input datetime-local
    const fechaInicio = new Date(funcion.fecha_hora_inicio);
    const fechaInicioStr = this.formatDateTimeLocal(fechaInicio);

    // Buscar la película para el título
    const peliculaEncontrada = this.peliculas.find(p => p.id_pelicula === funcion.id_pelicula);
    
    // Poblar el formulario
    this.funcionesForm.patchValue({
      pelicula_search: peliculaEncontrada?.titulo || `Película ID: ${funcion.id_pelicula}`,
      fecha_hora_inicio: fechaInicioStr,
      precio: funcion.precio_funcion,
      id_idioma: funcion.id_idioma,
      trailer_url: funcion.trailer_url,
      estado: funcion.estado,
      id_pelicula: funcion.id_pelicula,
      id_sala: funcion.id_sala
    });

    this.selectedPeliculaId = funcion.id_pelicula;
    this.selectedSalaId = funcion.id_sala;
    this.fechaHoraFin = new Date(funcion.fecha_hora_fin);
    
    // Actualizar el campo de búsqueda de película si los datos están disponibles
    this.updatePeliculaSearchField();
  }

  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Event handlers para películas
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

  // Event handlers para sedes
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
      sala_search: '',
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

  // Event handlers para salas
  loadSalasBySede(sedeId: number): void {
    this.isLoadingSalas = true;
    this.sedesSalasService.getSalasBySede(sedeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (salas) => {
          this.salas = this.filteredSalas = salas;
          this.isLoadingSalas = false;
          
          // Si estamos editando, seleccionar la sala actual
          if (this.funcionOriginal) {
            const salaActual = salas.find(s => s.id_sala === this.funcionOriginal!.id_sala);
            if (salaActual) {
              this.funcionesForm.patchValue({
                sala_search: salaActual.nombre
              });
            }
          }
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
      
      const precioValue = this.funcionesForm.value.precio;
      if (!precioValue || isNaN(Number(precioValue)) || Number(precioValue) <= 0) {
        this.alerta.error('Error', 'El precio debe ser un número válido mayor a 0.');
        this.isSubmitting = false;
        return;
      }
      
      const formData: Funciones = {
        id_funcion: this.funcionId,
        id_pelicula: this.selectedPeliculaId!,
        id_sala: this.selectedSalaId!,
        fecha_hora_inicio: new Date(this.funcionesForm.value.fecha_hora_inicio),
        fecha_hora_fin: this.fechaHoraFin,
        precio_funcion: Number(precioValue),
        id_idioma: Number(this.funcionesForm.value.id_idioma),
        trailer_url: this.funcionesForm.value.trailer_url.trim(),
        estado: this.funcionesForm.value.estado
      };


      this.funcionesService.updateFuncion(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.alerta.successRoute('Éxito', 'Función actualizada exitosamente!', 'funciones/list');
          },
          error: (err) => {
            console.error('Error updating function:', err);
            const mensaje = err.error?.message || 'Error al actualizar la función.';
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
    return this.areIdsSelected() && this.idiomas.length > 0 && !this.isLoadingFunction;
  }

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
    this.router.navigate(['/admin/funciones/list']);
  }

  private getIdiomasPorPelicula(pelicula: Pelicula): void {
    this.isLoadingIdiomas = true;
    this.peliculasService.getIdiomasByPeliculaId(pelicula.id_pelicula)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (idiomasPelicula) => {
          this.idiomasPelicula = idiomasPelicula;
          this.idiomas = this.idiomasOriginales.filter(idioma => 
            idiomasPelicula.includes(idioma.id_idioma)
          );
          
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

  private fechaFuturaValidator(control: any): {[key: string]: any} | null {
    if (!control.value) return null;
    
    const fechaSeleccionada = new Date(control.value);
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);
    
    return fechaSeleccionada >= fechaActual ? null : { fechaPasada: true };
  }

  private markFormGroupTouched(): void {
    Object.keys(this.funcionesForm.controls).forEach(key => {
      const control = this.funcionesForm.get(key);
      control?.markAsTouched();
    });
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.funcionesForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

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

  private updatePeliculaSearchField(): void {
    if (this.selectedPeliculaId && this.peliculas.length > 0) {
      const pelicula = this.peliculas.find(p => p.id_pelicula === this.selectedPeliculaId);
      if (pelicula) {
        this.funcionesForm.patchValue({
          pelicula_search: pelicula.titulo
        });
      }
    }
  }
}
