import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActoresService } from '../../../../services/actores.service';
import { PaisesService } from '../../../../services/paises.service';
import { CommonModule } from '@angular/common';
import { DistribuidorService } from '../../../../services/distribuidor.service';
import { AlertComponent } from '../../../../shared/alert/alert.component';
import { AlertaService } from '../../../../services/alerta.service';
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
      error: (err) => console.error('Error cargando distribuidores:', err)
    });
  }

  cargarPaises(): void {
    this.paisService.getPais().subscribe({
      next: (data) => {
        this.paises = data;
      },
      error: (err) => console.error('Error cargando países:', err)
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
          this.cargarDistribuidores();
          this.formDistribuidor.reset();
        },
        error: (err) => console.error('Error agregando distribuidor:', err)
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
  }

  guardarEdicion(): void {
    if (!this.distribuidorEditando || this.distribuidorEditando <= 0) {
      console.error('ID de distribuidor inválido');
      return;
    }

    // Asegura que los números sean números (no strings)
    const datosActualizados = {
      nombre: this.nombreTemporal,
      ano_fundacion: Number(this.anoFundacionTemporal) || 0,
      sitio_web: this.sitioWebTemporal || null,
      id_pais_origen: Number(this.paisOrigenTemporal) || 0 // Conversión explícita a número
    };

    this.distribuidorService.updateDistribuidor(Number(this.distribuidorEditando), datosActualizados).subscribe({
      next: () => {
        this.alerta.success('Actualizadp', 'Distribuidor actualizado con exito');
        this.cancelarEdicion();
        this.cargarDistribuidores();
      },
      error: (err) => {
        this.alerta.error('ERROR', err.error);
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
            this.cargarDistribuidores() 
          },
          error: (err) => console.error('Error eliminando distribuidor:', err)
        });
      }
    });
  }

  obtenerNombrePais(idPais: number): string {
    const pais = this.paises.find(p => p.id_pais === idPais);
    return pais ? pais.nombre : 'Desconocido';
  }
}