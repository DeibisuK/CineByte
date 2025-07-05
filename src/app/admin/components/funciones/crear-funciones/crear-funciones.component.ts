import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Pelicula } from '../../../models/pelicula.model';
import { Sede, SedeService } from '../../../../services/sede.service';
import { Sala } from '../../../models/salas.model';
import { Idiomas } from '../../../models/idiomas.model';
import { FuncionesService } from '../../../../services/funciones.service';
import { SalasService } from '../../../../services/salas.service';
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
export class CrearFuncionesComponent {
  FuncionesForm: FormGroup;
  // Datos originales
  peliculas: Pelicula[] = [];
  sedes: Sede[] = [];
  salas: SedeSala[] = [];
  idiomas: Idiomas[] = [];

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
  constructor(
    private fb: FormBuilder,
    private funcionesService: FuncionesService,
    private peliculasService: PeliculaService,
    private sedesService: SedeService,
    private sedesSalasService: SedeSalasService,
    private salasService: SalasService,
    private idiomasService: IdiomasService,
    private alerta: AlertaService
  ) {
    this.FuncionesForm = this.fb.group({
      pelicula_search: ['', Validators.required],
      sede_search: ['', Validators.required],
      sala_search: ['', Validators.required],
      fecha_hora_inicio: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(0)]],
      id_idioma: ['', Validators.required],
      id_pelicula: [''],
      id_sede: [''],
      id_sala: ['']
    });
  }

  ngOnInit() {
    this.peliculasService.getPeliculas().subscribe(p => {
      this.peliculas = this.filteredPeliculas = p;
    });

    this.sedesService.getSedes().subscribe(s => {
      this.sedes = this.filteredSedes = s;
    });

    this.idiomasService.getIdiomas().subscribe(i => {
      this.idiomas = i;
    });
  }
  // Métodos para Películas
  filterPeliculas(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredPeliculas = this.peliculas.filter(pelicula =>
      pelicula.titulo.toLowerCase().includes(query)
    );
    this.showPeliculasDropdown = true;
  }

  selectPelicula(pelicula: Pelicula) {
    this.selectedPeliculaId = pelicula.id_pelicula;
    this.FuncionesForm.patchValue({
      pelicula_search: pelicula.titulo,
      id_pelicula: pelicula.id_pelicula
    });
    this.showPeliculasDropdown = false;
  }

  togglePeliculasDropdown() {
    this.showPeliculasDropdown = !this.showPeliculasDropdown;
    if (this.showPeliculasDropdown) {
      this.filteredPeliculas = this.peliculas;
    }
  }

  hidePeliculasDropdown() {
    setTimeout(() => {
      this.showPeliculasDropdown = false;
    }, 200);
  }

  // Métodos para Sedes
  filterSedes(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredSedes = this.sedes.filter(sede =>
      sede.nombre.toLowerCase().includes(query)
    );
    this.showSedesDropdown = true;
  }

  selectSede(sede: Sede) {
    this.selectedSedeId = sede.id_sede ?? null;
    this.FuncionesForm.patchValue({
      sede_search: sede.nombre,
      id_sede: sede.id_sede,
      sala_search: '', // Limpiar sala seleccionada
      id_sala: ''
    });
    this.selectedSalaId = null;
    this.showSedesDropdown = false;
    this.loadSalasBySede(sede.id_sede ?? 0);
  }

  toggleSedesDropdown() {
    this.showSedesDropdown = !this.showSedesDropdown;
    if (this.showSedesDropdown) {
      this.filteredSedes = this.sedes;
    }
  }

  hideSedesDropdown() {
    setTimeout(() => {
      this.showSedesDropdown = false;
    }, 200);
  }

  // Métodos para Salas
  loadSalasBySede(sedeId: number) {
    this.sedesSalasService.getSalasBySede(sedeId).subscribe(salas => {
      this.salas = this.filteredSalas = salas;
    });
  }

  filterSalas(event: any) {
    if (!this.selectedSedeId) return;

    const query = event.target.value.toLowerCase();
    const salasDeSede = this.salas.filter(sala => sala.id_sede === this.selectedSedeId);

    this.filteredSalas = salasDeSede.filter(sala =>
      sala.nombre.toLowerCase().includes(query)
    );
    this.showSalasDropdown = true;
  }

  selectSala(sala: SedeSala) {
    this.selectedSalaId = sala.id_sala ?? null;
    this.FuncionesForm.patchValue({
      sala_search: sala.nombre,
      id_sala: sala.id_sala
    });
    this.showSalasDropdown = false;
  }

  toggleSalasDropdown() {
    if (!this.selectedSedeId) return;
    this.showSalasDropdown = !this.showSalasDropdown;
    if (this.showSalasDropdown) {
      this.loadSalasBySede(this.selectedSedeId);
    }
  }

  hideSalasDropdown() {
    setTimeout(() => {
      this.showSalasDropdown = false;
    }, 200);
  }

  // Método para enviar el formulario
  onSubmit() {
    if (this.FuncionesForm.valid) {
      const formData: Funciones = {
        id_funcion: '',
        id_pelicula: this.selectedPeliculaId!,
        id_sala: this.selectedSalaId!,
        fecha_hora_inicio: new Date(this.FuncionesForm.value.fecha_hora_inicio), // ← objeto Date
        precio: this.FuncionesForm.value.precio,
        id_idioma: this.FuncionesForm.value.id_idioma
      };
      ;

      this.funcionesService.addFuncion(formData).subscribe({
        next: () => {
          this.alerta.success('Éxito', 'Función creada exitosamente!');
          this.limpiarFormulario();
        },
        error: (err) => {
          console.error(err);
          this.alerta.error('Error', 'Error al crear la función.');
        }
      });
    } else {
      this.alerta.error('Error', 'Por favor, completa todos los campos requeridos.');
    }
  }

  // Método para limpiar el formulario
  limpiarFormulario() {
    this.FuncionesForm.reset();
    this.selectedPeliculaId = null;
    this.selectedSedeId = null;
    this.selectedSalaId = null;
    this.filteredPeliculas = this.peliculas;
    this.filteredSedes = this.sedes;
    this.filteredSalas = [];
  }
}