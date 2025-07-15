import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActoresService } from '@features/movies';
import { AlertaService } from '@core/services';
import { ActorCreateDTO } from '@core/models/actores.model';
import { Pais } from '@core/models/paises.model';
import { PaisesService } from '@features/catalog';

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
      error: () => {
        this.alerta.error('Error', 'No se pudieron cargar los países');
      }
    });
  }

  saveActor(): void {
    if (!this.actorForm.valid) {
      this.alerta.error('Formulario Inválido', 'Por favor complete todos los campos requeridos');
      return;
    }

    this.cargando = true;

    const localDateString: string = this.actorForm.value.fecha_nacimiento; // 'YYYY-MM-DDTHH:mm'
      let fechaUTC: Date | null = null;
      if (localDateString) {
        const [date, time] = localDateString.split('T');
        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = time.split(':').map(Number);
        fechaUTC = new Date(Date.UTC(year, month - 1, day, hour, minute));
      }

    const formValue = this.actorForm.value;
    const actorData: ActorCreateDTO = {
      ...formValue,
      fecha_nacimiento: fechaUTC!
    };

    this.service.addActor(actorData).subscribe({
      next: () => {
        this.alerta.success('Éxito', 'Actor creado correctamente');
        this.actorForm.reset();
        this.cerrarModal();
        this.actorCreado.emit();
      },
      error: () => {
        this.cargando = false;
        this.alerta.error('Error', 'No se pudo crear el actor');
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
    this.showPaisesDropdown = false;
    this.filteredPaises = [...this.paises];
  }
}