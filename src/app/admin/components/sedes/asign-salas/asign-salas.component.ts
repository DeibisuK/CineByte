import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SedeSalasService } from '@features/venues/services/sede-salas.service';
import { SedeSala, Sede, CreateSedeSalaRequest } from '@core/models/sede_salas.model';
import { Sala } from '@core/models/salas.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-asign-salas',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './asign-salas.component.html',
  styleUrl: './asign-salas.component.css'
})
export class AsignSalasComponent implements OnInit {
  asignacionForm: FormGroup;
  sedes: Sede[] = [];
  salas: Sala[] = [];
  salasDisponibles: Sala[] = [];
  asignacionesActuales: SedeSala[] = [];
  asignacionesSeleccionadas: CreateSedeSalaRequest[] = [];
  loading = false;
  sedeSeleccionada: number | null = null;

  // Selector personalizado de sedes
  menuSedesAbierto = false;
  ciudadesConSedes: any[] = [];
  sedeSeleccionadaObj: Sede | null = null;

  estados = ['Disponible', 'Mantenimiento', 'Pendiente', 'Deshabilitado'];

  constructor(
    private fb: FormBuilder,
    private sedeSalasService: SedeSalasService
  ) {
    this.asignacionForm = this.fb.group({
      id_sede: ['', [Validators.required]],
      id_sala: ['', [Validators.required]],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      estado: ['Disponible', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarSedes();
    this.cargarSalas();
    this.cargarTodasLasSalasDisponibles();
  }

  cargarSedes(): void {
    this.sedeSalasService.getSedes().subscribe({
      next: (sedes) => {
        this.sedes = sedes;
        this.agruparSedesPorCiudad();
      },
      error: (error) => {
        console.error('Error al cargar sedes:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las sedes',
          confirmButtonColor: '#3085d6'
        });
      }
    });
  }

  cargarSalas(): void {
    this.sedeSalasService.getSalas().subscribe({
      next: (salas) => {
        this.salas = salas;
      },
      error: (error) => {
        console.error('Error al cargar salas:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las salas',
          confirmButtonColor: '#3085d6'
        });
      }
    });
  }

  onSedeChange(): void {
    const idSede = this.asignacionForm.get('id_sede')?.value;
    if (idSede) {
      this.sedeSeleccionada = idSede;
      this.cargarAsignacionesActuales(idSede);
      // Las salas disponibles no dependen de la sede, son globales
      this.actualizarSalasDisponiblesParaFormulario();
    } else {
      this.sedeSeleccionada = null;
      this.salasDisponibles = [];
      this.asignacionesActuales = [];
    }
    this.asignacionForm.get('id_sala')?.setValue('');
  }

  cargarTodasLasSalasDisponibles(): void {
    this.sedeSalasService.getSalasDisponibles().subscribe({
      next: (salas) => {
        this.salasDisponibles = salas;
      },
      error: (error) => {
        console.error('Error al cargar salas disponibles:', error);
      }
    });
  }

  actualizarSalasDisponiblesParaFormulario(): void {
    // Filtrar las salas que ya están en la lista de asignaciones seleccionadas
    const salasEnAsignaciones = this.asignacionesSeleccionadas.map(a => a.id_sala).filter(id => id !== undefined);
    
    this.sedeSalasService.getSalasDisponibles().subscribe({
      next: (todasLasSalasDisponibles) => {
        this.salasDisponibles = todasLasSalasDisponibles.filter(
          sala => sala.id_sala !== undefined && !salasEnAsignaciones.includes(sala.id_sala)
        );
      },
      error: (error) => {
        console.error('Error al actualizar salas disponibles:', error);
      }
    });
  }

  cargarSalasDisponibles(idSede: number): void {
    // Método mantenido para compatibilidad pero ahora carga todas las salas disponibles
    this.cargarTodasLasSalasDisponibles();
  }

  cargarAsignacionesActuales(idSede: number): void {
    this.sedeSalasService.getSalasBySede(idSede).subscribe({
      next: (asignaciones) => {
        this.asignacionesActuales = asignaciones;
      },
      error: (error) => {
        console.error('Error al cargar asignaciones actuales:', error);
      }
    });
  }

  onSalaChange(): void {
    const idSala = this.asignacionForm.get('id_sala')?.value;
    if (idSala) {
      const salaSeleccionada = this.salasDisponibles.find(s => s.id_sala == idSala);
      if (salaSeleccionada) {
        const sedeSeleccionada = this.sedes.find(s => s.id_sede == this.sedeSeleccionada);
        if (sedeSeleccionada) {
          this.asignacionForm.get('nombre')?.setValue(
            `${salaSeleccionada.nombre} - ${sedeSeleccionada.nombre}`
          );
        }
      }
    }
  }

  agregarAsignacion(): void {
    if (this.asignacionForm.valid) {
      const nuevaAsignacion: CreateSedeSalaRequest = {
        id_sede: this.asignacionForm.get('id_sede')?.value,
        id_sala: this.asignacionForm.get('id_sala')?.value,
        nombre: this.asignacionForm.get('nombre')?.value,
        estado: this.asignacionForm.get('estado')?.value
      };

      // Verificar si ya existe en las asignaciones seleccionadas
      const yaExiste = this.asignacionesSeleccionadas.some(
        a => a.id_sede === nuevaAsignacion.id_sede && a.id_sala === nuevaAsignacion.id_sala
      );

      if (yaExiste) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'Esta asignación ya está en la lista',
          confirmButtonColor: '#3085d6'
        });
        return;
      }

      this.asignacionesSeleccionadas.push(nuevaAsignacion);
      
      // Limpiar formulario excepto la sede
      this.asignacionForm.patchValue({
        id_sala: '',
        nombre: '',
        estado: 'Disponible'
      });

      // Actualizar salas disponibles (remover la sala que acabamos de asignar)
      this.actualizarSalasDisponiblesParaFormulario();
    }
  }

  eliminarAsignacion(index: number): void {
    this.asignacionesSeleccionadas.splice(index, 1);
    // Actualizar salas disponibles (agregar la sala que acabamos de quitar)
    this.actualizarSalasDisponiblesParaFormulario();
  }

  guardarAsignaciones(): void {
    if (this.asignacionesSeleccionadas.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'No hay asignaciones para guardar',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    this.loading = true;
    
    this.sedeSalasService.createMultipleSedesSalas({ sedes_salas: this.asignacionesSeleccionadas }).subscribe({
      next: (response) => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Las asignaciones se guardaron correctamente',
          confirmButtonColor: '#3085d6'
        });
        
        // Limpiar formulario y listas
        this.asignacionesSeleccionadas = [];
        this.asignacionForm.reset();
        this.sedeSeleccionada = null;
        this.asignacionesActuales = [];
        this.sedeSeleccionadaObj = null;
        
        // Recargar todas las salas disponibles
        this.cargarTodasLasSalasDisponibles();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al guardar asignaciones:', error);
        
        let errorMessage = 'No se pudieron guardar las asignaciones';
        
        // Manejar errores específicos del nuevo modelo
        if (error.error?.message) {
          if (error.error.message.includes('ya está asignada')) {
            errorMessage = error.error.message;
          }
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonColor: '#3085d6'
        });
      }
    });
  }

  eliminarAsignacionActual(asignacion: SedeSala): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar la asignación "${asignacion.nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.sedeSalasService.deleteSedeSala(asignacion.id_sede_sala).subscribe({
          next: () => {
            Swal.fire(
              '¡Eliminada!',
              'La asignación ha sido eliminada.',
              'success'
            );
            this.cargarAsignacionesActuales(asignacion.id_sede);
            // Recargar todas las salas disponibles ya que una sala se liberó
            this.cargarTodasLasSalasDisponibles();
          },
          error: (error) => {
            console.error('Error al eliminar asignación:', error);
            Swal.fire(
              'Error',
              'No se pudo eliminar la asignación',
              'error'
            );
          }
        });
      }
    });
  }

  /**
   * NUEVO MODELO: Las salas no pueden repetirse entre sedes
   * - Una sala solo puede estar asignada a una sede específica
   * - Las salas disponibles son globales (no dependen de la sede seleccionada)
   * - Se valida en el backend que no se repitan asignaciones
   */

  agruparSedesPorCiudad(): void {
    const ciudadesMap = new Map<string, any>();
    
    this.sedes.forEach(sede => {
      const ciudad = sede.ciudad || 'Sin Ciudad';
      if (!ciudadesMap.has(ciudad)) {
        ciudadesMap.set(ciudad, {
          nombre: ciudad,
          sedes: []
        });
      }
      ciudadesMap.get(ciudad)!.sedes.push(sede);
    });
    
    this.ciudadesConSedes = Array.from(ciudadesMap.values()).sort((a, b) => 
      a.nombre.localeCompare(b.nombre)
    );
  }

  toggleMenuSedes(): void {
    this.menuSedesAbierto = !this.menuSedesAbierto;
  }

  seleccionarSede(sede: Sede): void {
    this.sedeSeleccionadaObj = sede;
    this.asignacionForm.patchValue({
      id_sede: sede.id_sede
    });
    this.menuSedesAbierto = false;
    this.onSedeChange();
  }

  get nombre() { return this.asignacionForm.get('nombre')!; }
  get id_sede() { return this.asignacionForm.get('id_sede')!; }
  get id_sala() { return this.asignacionForm.get('id_sala')!; }

  // Métodos helper para el template
  getNombreSede(idSede: number): string {
    return this.sedes.find(s => s.id_sede === idSede)?.nombre || 'Sede no encontrada';
  }

  getNombreSala(idSala: number): string {
    return this.salas.find(s => s.id_sala === idSala)?.nombre || 'Sala no encontrada';
  }

  getEstadoClass(estado: string): string {
    return 'estado-' + estado.toLowerCase();
  }

  // Cerrar dropdown al hacer clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const selectorSede = target.closest('.selector-sede');
    if (!selectorSede && this.menuSedesAbierto) {
      this.menuSedesAbierto = false;
    }
  }
}
