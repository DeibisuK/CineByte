import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActoresService } from '../../../../services/actores.service';
import { AlertaService } from '../../../../services/alerta.service';
import { ActorCreateDTO } from '../../../models/actores.model';
import { Pais } from '../../../models/paises.model';
import { PaisesService } from '../../../../services/paises.service';

@Component({
  selector: 'app-crear-actor',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './crear-actor.component.html',
  styleUrl: './crear-actor.component.css'
})
export class CrearActorComponent implements OnInit {
  @Input() mostrar = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() actorCreado = new EventEmitter<void>();
  
  actorForm: FormGroup;
  paises: Pais[] = [];
  cargando = false;

  // Propiedades para el dropdown con buscador
  paisSearchTerm: string = '';
  filteredPaises: Pais[] = [];
  showPaisesDropdown: boolean = false;

  constructor(
    private service: ActoresService, 
    private alerta: AlertaService, 
    private paisService: PaisesService
  ) {
    this.actorForm = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(2)]),
      apellidos: new FormControl('', [Validators.required, Validators.minLength(2)]),
      fecha_nacimiento: new FormControl('', Validators.required),
      id_nacionalidad: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.cargarPaises();
  }

  cargarPaises(): void {
    this.paisService.getPais().subscribe({
      next: (data) => {
        // Ordenar alfabéticamente
        this.paises = data.sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.filteredPaises = [...this.paises];
      },
      error: (err) => {
        this.alerta.error('Error', 'No se pudieron cargar los países');
        console.error(err);
      }
    });
  }

  saveActor(): void {
    if (!this.actorForm.valid) {
      this.alerta.error('Formulario Inválido', 'Por favor complete todos los campos requeridos');
      return;
    }

    this.cargando = true;
    
    // Convertir la fecha a formato ISO string
    const formValue = this.actorForm.value;
    const actorData: ActorCreateDTO = {
      ...formValue,
      fecha_nacimiento: new Date(formValue.fecha_nacimiento).toISOString()
    };

    this.service.addActor(actorData).subscribe({
      next: () => {
        this.alerta.success('Éxito', 'Actor creado correctamente');
        this.actorForm.reset();
        this.cerrarModal();
        this.actorCreado.emit(); // Notificar que se creó un nuevo actor
      },
      error: (err) => {
        this.cargando = false;
        this.alerta.error('Error', 'No se pudo crear el actor');
        console.error(err);
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }

  // Métodos para el dropdown con buscador
  filterPaises(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredPaises = this.paises.filter(pais =>
      pais.nombre.toLowerCase().includes(searchTerm)
    );
  }

  selectPais(pais: Pais): void {
    this.actorForm.get('id_nacionalidad')?.setValue(pais.id_pais);
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
    setTimeout(() => this.showPaisesDropdown = false, 200);
    this.filteredPaises = [...this.paises];
  }
}