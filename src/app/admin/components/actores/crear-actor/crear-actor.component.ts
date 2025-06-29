import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActoresService } from '../../../../services/actores.service';
import { AlertaService } from '../../../../services/alerta.service';
import { Actores } from '../../../models/actores.model';
import { Pais } from '../../../models/paises.model';
import { PaisesService } from '../../../../services/paises.service';

@Component({
  selector: 'app-crear-actor',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-actor.component.html',
  styleUrl: './crear-actor.component.css'
})
export class CrearActorComponent {
  @Input() mostrar = false;
  @Output() cerrar = new EventEmitter<void>();
  actorform: FormGroup;
  paises:Pais[] = [];

  constructor(private service: ActoresService, private alerta: AlertaService, private paisService:PaisesService) {
    this.actorform = new FormGroup({
      nombre: new FormControl('', Validators.required),
      apellidos: new FormControl('', Validators.required),
      fecha_nacimiento: new FormControl('', Validators.required),
      id_nacionalidad: new FormControl('', Validators.required),
    });
  }
  saveActor() {
    if (!this.actorform.valid) {
      this.alerta.error("Formulario Inválido", "Rellene todos los campos");
      return;
    }
    try {
      const actor: Actores = this.actorform.value
      this.service.addActor(actor).subscribe({
        next: () => {
          this.alerta.success("Actor creado", "El actor se guardó correctamente");
          this.cerrarModal();
        },
        error: () => {
          this.alerta.error("Error", "Error al guardar el actor");
        }
      });
    } catch (error) {
      this.alerta.error("Error", "Error al guardar el actor");

    }
  }
  cerrarModal() {
    this.cerrar.emit();
  }

  getNacionalidad():Pais[]{
    this.paisService.getPais().subscribe({
      next: (data) => {
        this.paises = data;
      }
    });
    return this.paises;
  }
}
