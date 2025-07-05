import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Pelicula } from '../../../models/pelicula.model';
import { Sede } from '../../../../services/sede.service';
import { Sala } from '../../../models/salas.model';
import { Idiomas } from '../../../models/idiomas.model';

@Component({
  selector: 'app-crear-funciones',
  imports: [CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './crear-funciones.component.html',
  styleUrl: './crear-funciones.component.css'
})
export class CrearFuncionesComponent {
 FuncionesForm: FormGroup;
  // Datos originales
  peliculas: Pelicula[] = [];
  sedes: Sede[] = [];
  salas: Sala[] = [];
  idiomas: Idiomas[] = [];

  // Datos filtrados
  filteredPeliculas: Pelicula[] = [];
  filteredSedes: Sede[] = [];
  filteredSalas: Sala[] = [];

  // Estados de dropdowns
  showPeliculasDropdown = false;
  showSedesDropdown = false;
  showSalasDropdown = false;

  // IDs seleccionados
  selectedPeliculaId: number | null = null;
  selectedSedeId: number | null = null;
  selectedSalaId: number | null = null;

  constructor(private fb: FormBuilder) {
    this.FuncionesForm = this.fb.group({
      pelicula_search: ['', Validators.required],
      sede_search: ['', Validators.required],
      sala_search: ['', Validators.required],
      fecha_hora_inicio: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(0)]],
      id_idioma: ['', Validators.required],
      // Campos ocultos para almacenar los IDs
      id_pelicula: [''],
      id_sede: [''],
      id_sala: ['']
    });
  }

  ngOnInit() {
    this.filteredPeliculas = this.peliculas;
    this.filteredSedes = this.sedes;
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
    //this.filteredSalas = this.salas.filter(sala => sala.id_sede === sedeId);
  }

  filterSalas(event: any) {
    if (!this.selectedSedeId) return;
    
    const query = event.target.value.toLowerCase();
    //const salasDeSede = this.salas.filter(sala => sala.id_sede === this.selectedSedeId);
    
   // this.filteredSalas = salasDeSede.filter(sala =>
    //  sala.nombre.toLowerCase().includes(query)
    //);
    this.showSalasDropdown = true;
  }

  selectSala(sala: Sala) {
    this.selectedSalaId = sala.id_sala ?? null;
    this.FuncionesForm.patchValue({
      //sala_search: `${sala.nombre} - ${sala.capacidad} asientos`,
      //id_sala: sala.id
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
      const formData = {
        id_pelicula: this.selectedPeliculaId,
        id_sede: this.selectedSedeId,
        id_sala: this.selectedSalaId,
        fecha_hora_inicio: this.FuncionesForm.value.fecha_hora_inicio,
        precio: this.FuncionesForm.value.precio,
        id_idioma: this.FuncionesForm.value.id_idioma
      };

      console.log('Datos del formulario:', formData);
      
      // Aquí enviarías los datos a tu servicio
      // this.funcionesService.crearFuncion(formData).subscribe(...)
      
      alert('Función creada exitosamente!');
    } else {
      alert('Por favor, completa todos los campos requeridos.');
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