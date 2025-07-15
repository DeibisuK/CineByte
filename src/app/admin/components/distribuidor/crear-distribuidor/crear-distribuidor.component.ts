import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { AlertaService } from '@core/services';
import { Distribuidor } from '@core/models/distribuidor.model';
import { DistribuidorService } from '@features/catalog';
import { CommonModule } from '@angular/common';
import { Pais } from '@core/models/paises.model';
import { PaisesService } from '@features/catalog';

@Component({
  selector: 'app-crear-distribuidor',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './crear-distribuidor.component.html',
  styleUrl: './crear-distribuidor.component.css'
})
export class CrearDistribuidorComponent implements OnInit {
  @Input() mostrar = false;
  @Output() cerrar = new EventEmitter<void>();
  distribuidorform: FormGroup;
  paises: Pais[] = [];

  // Propiedades para el dropdown con buscador
  paisSearchTerm: string = '';
  filteredPaises: Pais[] = [];
  showPaisesDropdown: boolean = false;

  constructor(private service: DistribuidorService, private alerta: AlertaService,
    private paisService: PaisesService
  ) {
    this.distribuidorform = new FormGroup({
      nombre: new FormControl('', Validators.required),
      ano_fundacion: new FormControl('', Validators.required),
      sitio_web: new FormControl('', Validators.required),
      id_pais_origen: new FormControl('', Validators.required)
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
  saveDistribuidor() {
    if (!this.distribuidorform.valid) {
      this.alerta.error("Formulario Inválido", "Rellene todos los campos");
      return;
    }

    const distri: Distribuidor = this.distribuidorform.value as Distribuidor;
    this.service.addDisitribuidor(distri).subscribe({
      next: () => {
        this.alerta.success("Distribuidor creado", "El distribuidor se guardó correctamente");
        this.distribuidorform.reset();
        this.cerrarModal();
      },
      error: () => {
        this.alerta.error("Error", "Error al guardar el distribuidor");
      }
    });
  }
  cerrarModal() {
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
    this.distribuidorform.get('id_pais_origen')?.setValue(pais.id_pais);
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
