import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
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
  
  // Opciones para dropdown de estado
  estadosDisponibles = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'cancelado', label: 'Cancelado' },
    { value: 'agotado', label: 'Agotado' }
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
      fecha_hora_inicio: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(0)]],
      id_idioma: ['', Validators.required],
      trailer_url: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/)]],
      estado: ['activo', Validators.required],
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
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
        this.alerta.error('Error', 'Error al cargar los datos iniciales.');
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
    this.sedesSalasService.getSalasBySede(sedeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (salas) => {
          this.salas = this.filteredSalas = salas;
        },
        error: (error) => {
          console.error('Error loading salas:', error);
          this.alerta.error('Error', 'Error al cargar las salas.');
        }
      });
  }

  filterSalas(event: Event): void {
    if (!this.selectedSedeId) return;

    const target = event.target as HTMLInputElement;
    const query = target.value.toLowerCase();
    const salasDeSede = this.salas.filter(sala => sala.id_sede === this.selectedSedeId);

    this.filteredSalas = salasDeSede.filter(sala =>
      sala.nombre.toLowerCase().includes(query)
    );
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

  // Método para enviar el formulario
  onSubmit(): void {
    if (this.funcionesForm.valid && this.areIdsSelected() && this.fechaHoraFin) {
      this.isSubmitting = true;
      
      const formData: Funciones = {
        id_funcion: '',
        id_pelicula: this.selectedPeliculaId!,
        id_sala: this.selectedSalaId!,
        fecha_hora_inicio: new Date(this.funcionesForm.value.fecha_hora_inicio),
        fecha_hora_fin: this.fechaHoraFin,
        precio: this.funcionesForm.value.precio,
        id_idioma: this.funcionesForm.value.id_idioma,
        trailer_url: this.funcionesForm.value.trailer_url,
        estado: this.funcionesForm.value.estado
      };

      this.funcionesService.addFuncion(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.alerta.success('Éxito', 'Función creada exitosamente!');
            this.limpiarFormulario();
          },
          error: (err) => {
            console.error('Error creating function:', err);
            this.alerta.error('Error', 'Error al crear la función.');
          },
          complete: () => {
            this.isSubmitting = false;
          }
        });
    } else {
      this.alerta.error('Error', 'Por favor, completa todos los campos requeridos.');
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

  // Método para limpiar el formulario
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
  }

  private getIdiomasPorPelicula(pelicula: Pelicula): void {
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
        },
        error: (error) => {
          console.error('Error loading idiomas for pelicula:', error);
          this.alerta.error('Error', 'Error al cargar los idiomas de la película.');
        }
      });
  }
}