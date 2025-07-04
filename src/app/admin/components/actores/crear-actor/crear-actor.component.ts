import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActoresService } from '../../../../services/actores.service';
import { AlertaService } from '../../../../services/alerta.service';
import { ActorCreateDTO } from '../../../models/actores.model';
import { Pais } from '../../../models/paises.model';
import { PaisesService } from '../../../../services/paises.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-actor',
  imports: [CommonModule, ReactiveFormsModule],
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
        this.paises = data;
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudieron cargar los países', 'error');
        console.error(err);
      }
    });
  }

  saveActor(): void {
    if (!this.actorForm.valid) {
      this.alerta.error("Formulario Inválido", "Por favor complete todos los campos requeridos");
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
        Swal.fire('Éxito', 'Actor creado correctamente', 'success');
        this.actorForm.reset();
        this.cerrarModal();
        this.actorCreado.emit(); // Notificar que se creó un nuevo actor
      },
      error: (err) => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudo crear el actor', 'error');
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
}