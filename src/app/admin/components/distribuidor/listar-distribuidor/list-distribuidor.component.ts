import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaisesService } from '@features/catalog';
import { CommonModule } from '@angular/common';
import { DistribuidorService } from '@features/catalog';
import { AlertaService } from '@core/services';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-distribuidor',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './list-distribuidor.component.html',
  styleUrl: './list-distribuidor.component.css'
})
export class ListDistribuidorComponent implements OnInit {
  formDistribuidor: FormGroup;
  distribuidores: any[] = [];
  distribuidoresFiltrados: any[] = [];
  paises: any[] = [];
  filtroDistribuidores: string = '';
  distribuidorEditando: number = 0;
  nombreTemporal: string = '';
  anoFundacionTemporal: number | null = null;
  sitioWebTemporal: string = '';
  paisOrigenTemporal: number | null = null;

  // Propiedades para el dropdown con buscador - Formulario
  paisSearchTerm: string = '';
  filteredPaises: any[] = [];
  showPaisesDropdown: boolean = false;

  // Propiedades para el dropdown con buscador - Edición
  paisEditSearchTerm: string = '';
  filteredPaisesEdit: any[] = [];
  showPaisesEditDropdown: boolean = false;


  constructor(
    private fb: FormBuilder,
    private distribuidorService: DistribuidorService,
    private paisService: PaisesService,
    private alerta: AlertaService
  ) {
    this.formDistribuidor = this.fb.group({
      nombre: ['', Validators.required],
      id_pais_origen: ['', Validators.required],
      ano_fundacion: ['', [Validators.required, Validators.min(1800), Validators.max(new Date().getFullYear())]],
      sitio_web: ['', Validators.pattern('^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')]
    });
  }

  ngOnInit(): void {
    this.cargarDistribuidores();
    this.cargarPaises();
  }

  cargarDistribuidores(): void {
    this.distribuidorService.getDistribuidor().subscribe({
      next: (data) => {
        this.distribuidores = data;
        this.distribuidoresFiltrados = [...data];
      },
      error: () => {
        this.alerta.error('Error', 'No se pudieron cargar los distribuidores');
      }
    });
  }

  cargarPaises(): void {
    this.paisService.getPais().subscribe({
      next: (data) => {
        // Ordenar alfabéticamente
        this.paises = data.sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
        this.filteredPaises = [...this.paises];
        this.filteredPaisesEdit = [...this.paises];
      },
      error: () => {
        this.alerta.error('Error', 'No se pudieron cargar los países');
      }
    });
  }

  totalDistribuidores(): number {
    return this.distribuidores.length;
  }

  addDistribuidor(): void {
    if (this.formDistribuidor.valid) {
      const distribuidorData = this.formDistribuidor.value;

      // Asegurar que el sitio web no empiece con http:// o https://
      if (distribuidorData.sitio_web && !distribuidorData.sitio_web.startsWith('http')) {
        distribuidorData.sitio_web = distribuidorData.sitio_web.replace(/^https?:\/\//, '');
      }

      this.distribuidorService.addDisitribuidor(distribuidorData).subscribe({
        next: () => {
          this.alerta.success('Éxito', 'Distribuidor creado correctamente');
          this.cargarDistribuidores();
          this.formDistribuidor.reset();
          // Resetear dropdown
          this.paisSearchTerm = '';
          this.filteredPaises = [...this.paises];
        },
        error: () => {
          this.alerta.error('Error', 'No se pudo crear el distribuidor');
        }
      });
    }
  }

  aplicarFiltro(): void {
    if (!this.filtroDistribuidores) {
      this.distribuidoresFiltrados = [...this.distribuidores];
      return;
    }

    const filtro = this.filtroDistribuidores.toLowerCase();
    this.distribuidoresFiltrados = this.distribuidores.filter(d =>
      d.nombre.toLowerCase().includes(filtro) ||
      (this.obtenerNombrePais(d.id_pais_origen)?.toLowerCase().includes(filtro)
      ))
  }

  activarEdicion(distribuidor: any): void {
    this.distribuidorEditando = distribuidor.id_distribuidora;
    this.nombreTemporal = distribuidor.nombre;
    this.anoFundacionTemporal = distribuidor.ano_fundacion;
    this.sitioWebTemporal = distribuidor.sitio_web;
    this.paisOrigenTemporal = distribuidor.id_pais_origen;
    
    // Inicializar dropdown de edición
    const paisSeleccionado = this.paises.find(p => p.id_pais === distribuidor.id_pais_origen);
    this.paisEditSearchTerm = paisSeleccionado ? paisSeleccionado.nombre : '';
    this.filteredPaisesEdit = [...this.paises];
  }

  guardarEdicion(): void {
    if (!this.distribuidorEditando || this.distribuidorEditando <= 0) {
      this.alerta.error('Error', 'ID de distribuidor inválido');
      return;
    }

    // Asegura que los números sean números (no strings)
    const datosActualizados = {
      nombre: this.nombreTemporal,
      ano_fundacion: Number(this.anoFundacionTemporal) || 0,
      sitio_web: this.sitioWebTemporal || null,
      id_pais_origen: Number(this.paisOrigenTemporal) || 0 // Conversión explícita a número
    };

    console.log('Datos a actualizar:', datosActualizados);

    this.distribuidorService.updateDistribuidor(this.distribuidorEditando, datosActualizados).subscribe({
      next: () => {
        this.alerta.success('Actualizado', 'Distribuidor actualizado con éxito');
        this.cancelarEdicion();
        this.cargarDistribuidores();
      },
      error: () => {
        this.alerta.error('Error', 'No se pudo actualizar el distribuidor');
      }
    });
  }

  cancelarEdicion(): void {
    this.distribuidorEditando = 0;
    this.nombreTemporal = '';
    this.anoFundacionTemporal = null;
    this.sitioWebTemporal = '';
    this.paisOrigenTemporal = null;
  }

  deleteDistribuidor(id: number, nombre: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el distribuidor ' + nombre + ' permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.distribuidorService.deleteDisitribuidor(id).subscribe({
          next: () => { 
            this.alerta.success('Eliminado', 'Distribuidor eliminado correctamente');
            this.cargarDistribuidores();
          },
          error: () => {
            this.alerta.error('Error', 'No se pudo eliminar el distribuidor');
          }
        });
      }
    });
  }

  obtenerNombrePais(idPais: number): string {
    const pais = this.paises.find(p => p.id_pais === idPais);
    return pais ? pais.nombre : 'Desconocido';
  }

  // Métodos para el dropdown con buscador - Formulario
  filterPaises(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredPaises = this.paises.filter(pais =>
      pais.nombre.toLowerCase().includes(searchTerm)
    );
  }

  selectPais(pais: any): void {
    this.formDistribuidor.get('id_pais_origen')?.setValue(pais.id_pais);
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

  // Métodos para el dropdown con buscador - Edición
  filterPaisesEdit(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredPaisesEdit = this.paises.filter(pais =>
      pais.nombre.toLowerCase().includes(searchTerm)
    );
  }

  selectPaisEdit(pais: any): void {
    this.paisOrigenTemporal = pais.id_pais;
    this.paisEditSearchTerm = pais.nombre;
    this.showPaisesEditDropdown = false;
  }

  togglePaisesEditDropdown(): void {
    this.showPaisesEditDropdown = !this.showPaisesEditDropdown;
    if (this.showPaisesEditDropdown) {
      this.filteredPaisesEdit = [...this.paises];
    }
  }

  hidePaisesEditDropdown(): void {
    this.showPaisesEditDropdown = false;
    this.filteredPaisesEdit = [...this.paises];
  }
}