import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActoresService } from '../../../../services/actores.service';
import { PaisesService } from '../../../../services/paises.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-listar-actores',
  imports: [CommonModule, FormsModule,ReactiveFormsModule],
  templateUrl: './listar-actores.component.html',
  styleUrl: './listar-actores.component.css'
})
export class ListarActoresComponent implements OnInit {
  formActor: FormGroup;
  actores: any[] = [];
  actoresFiltrados: any[] = [];
  paises: any[] = [];
  filtroActores: string = '';
  actorEditando: number | null = null;
  nombreTemporal: string = '';
  apellidosTemporal: string = '';

  constructor(
    private fb: FormBuilder,
    private actorService: ActoresService,
    private paisService: PaisesService
  ) {
    this.formActor = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
      id_nacionalidad: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarActores();
    this.cargarPaises();
  }

  cargarActores(): void {
    this.actorService.getActor().subscribe(data => {
      this.actores = data;
      this.actoresFiltrados = [...data];
    });
  }

  cargarPaises(): void {
    this.paisService.getPais().subscribe(data => {
      this.paises = data;
    });
  }

  totalActores(): number {
    return this.actores.length;
  }

  addActor(): void {
    if (this.formActor.valid) {
      this.actorService.addActor(this.formActor.value).subscribe({
        next: () => {
          this.cargarActores();
          this.formActor.reset();
        },
        error: (err) => console.error(err)
      });
    }
  }

  aplicarFiltro(): void {
    if (!this.filtroActores) {
      this.actoresFiltrados = [...this.actores];
      return;
    }
    
    const filtro = this.filtroActores.toLowerCase();
    this.actoresFiltrados = this.actores.filter(actor => 
      actor.nombre.toLowerCase().includes(filtro) || 
      actor.apellidos.toLowerCase().includes(filtro)
  )}

  activarEdicion(actor: any): void {
    this.actorEditando = actor.id_actor;
    this.nombreTemporal = actor.nombre;
    this.apellidosTemporal = actor.apellidos;
  }
 /*
  guardarEdicion(actor: any): void {
    const datosActualizados = {
      nombre: this.nombreTemporal,
      apellidos: this.apellidosTemporal
    };
    
    this.actorService.updateActor(actor.id_actor, datosActualizados).subscribe({
      next: () => {
        this.cargarActores();
        this.cancelarEdicion();
      },
      error: (err) => console.error(err)
    });
  }

  cancelarEdicion(): void {
    this.actorEditando = null;
    this.nombreTemporal = '';
    this.apellidosTemporal = '';
  }


  deleteActor(id: number, nombre: string): void {
    if (confirm(`¿Estás seguro de eliminar al actor ${nombre}?`)) {
      this.actorService.deleteActor(id).subscribe({
        next: () => this.cargarActores(),
        error: (err) => console.error(err)
      });
    }
  }
*/

  obtenerNombrePais(idPais: number): string {
    const pais = this.paises.find(p => p.id_pais === idPais);
    return pais ? pais.nombre : 'Desconocido';
  }
}