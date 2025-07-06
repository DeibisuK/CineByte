import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActoresService } from '../../../../services/actores.service';
import { PaisesService } from '../../../../services/paises.service';
import { CommonModule } from '@angular/common';
import { Actores } from '../../../models/actores.model';
import { AlertaService } from '../../../../services/alerta.service';

@Component({
  selector: 'app-listar-actores',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './listar-actores.component.html',
  styleUrl: './listar-actores.component.css'
})
export class ListarActoresComponent implements OnInit {
  formActor: FormGroup;
  actores: Actores[] = [];
  actoresFiltrados: Actores[] = [];
  paises: any[] = [];
  filtroActores: string = '';
  actorEditando: number | null = null;
  nombreTemporal: string = '';
  apellidosTemporal: string = '';
  fechaNacimientoTemporal: string = '';
  nacionalidadTemporal: number | null = null;

  constructor(
    private fb: FormBuilder,
    private actorService: ActoresService,
    private paisService: PaisesService,
    private alerta: AlertaService
  ) {
    this.formActor = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      fecha_nacimiento: ['', Validators.required],
      id_nacionalidad: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarPaises().then(() => {
      this.cargarActores();
    });
  }

  cargarActores(): void {
    this.actorService.getActor().subscribe({
      next: (data) => {
        this.actores = data.map(actor => ({
          ...actor,
          nombrePais: this.obtenerNombrePais(actor.id_nacionalidad),
          fecha_nacimiento: new Date(actor.fecha_nacimiento)
        }));
        this.actoresFiltrados = [...this.actores];
      },
      error: (err) => {
        this.alerta.error('Error', 'No se pudieron cargar los actores');
        console.error(err);
      }
    });
  }

  cargarPaises(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.paisService.getPais().subscribe({
        next: (data) => {
          this.paises = data;
          resolve();
        },
        error: (err) => {
          this.alerta.error('Error', 'No se pudieron cargar los países');
          reject(err);
        }
      });
    });
  }

  totalActores(): number {
    return this.actores.length;
  }

  addActor(): void {
    if (this.formActor.valid) {
      const actorData = this.formActor.value;
      actorData.fecha_nacimiento = new Date(actorData.fecha_nacimiento).toISOString();

      this.actorService.addActor(actorData).subscribe({
        next: () => {
          this.alerta.success('Éxito', 'Actor agregado correctamente');
          this.cargarActores();
          this.formActor.reset();
        },
        error: (err) => {
          this.alerta.error('Error', 'No se pudo agregar el actor');
          console.error(err);
        }
      });
    } else {
      this.alerta.warning('Advertencia', 'Por favor complete todos los campos requeridos');
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

  activarEdicion(actor: Actores): void {
    this.actorEditando = actor.id_actor;
    this.nombreTemporal = actor.nombre;
    this.apellidosTemporal = actor.apellidos;
    this.fechaNacimientoTemporal = this.formatDateForInput(new Date(actor.fecha_nacimiento));
    this.nacionalidadTemporal = actor.id_nacionalidad;
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  guardarEdicion(): void {
    if (!this.actorEditando) {
      this.alerta.error('Error', 'ID de actor inválido');
      return;
    }

    if (!this.nombreTemporal || !this.apellidosTemporal || !this.fechaNacimientoTemporal || !this.nacionalidadTemporal) {
      this.alerta.warning('Advertencia', 'Todos los campos son requeridos');
      return;
    }

    const actorActualizado = {
      nombre: this.nombreTemporal,
      apellidos: this.apellidosTemporal,
      fecha_nacimiento: new Date(this.fechaNacimientoTemporal).toISOString(),
      id_nacionalidad: this.nacionalidadTemporal
    };

    this.actorService.updateActor(this.actorEditando, actorActualizado).subscribe({
      next: () => {
        this.alerta.success('Éxito', 'Actor actualizado correctamente');
        this.cargarActores();
        this.cancelarEdicion();
      },
      error: (err) => {
        this.alerta.error('Error', 'No se pudo actualizar el actor');
        console.error(err);
      }
    });
  }

  cancelarEdicion(): void {
    this.actorEditando = null;
    this.nombreTemporal = '';
    this.apellidosTemporal = '';
    this.fechaNacimientoTemporal = '';
    this.nacionalidadTemporal = null;
  }

  deleteActor(id: number, nombre: string): void {
    this.alerta.confirmacion('¿Estás seguro?', `Esta acción eliminará al actor ${nombre} permanentemente`, 'Sí, eliminar', 'Cancelar').then((result: { isConfirmed: boolean }) => {
      if (result.isConfirmed) {
        this.actorService.deleteActor(id).subscribe({
          next: () => {
            this.alerta.success('Eliminado', 'El actor ha sido eliminado');
            this.cargarActores();
          },
          error: (err) => {
            this.alerta.error('Error', 'No se pudo eliminar el actor');
            console.error(err);
          }
        });
      }
    });
  }

  obtenerNombrePais(idPais: number | null): string {
    if (!idPais) return 'Desconocido';
    const pais = this.paises.find(p => p.id_pais === idPais);
    return pais?.nombre || 'Desconocido';
  }
}