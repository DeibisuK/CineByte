import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertaService } from '../../../../services/alerta.service';
import { Distribuidor } from '../../../models/distribuidor.model';
import { DistribuidorService } from '../../../../services/distribuidor.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crear-distribuidor',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './crear-distribuidor.component.html',
  styleUrl: './crear-distribuidor.component.css'
})
export class CrearDistribuidorComponent {
  @Input() mostrar = false;
  @Output() cerrar = new EventEmitter<void>();
  distribuidorform: FormGroup;

  constructor(private service: DistribuidorService, private alerta: AlertaService) {
    this.distribuidorform = new FormGroup({
      nombre: new FormControl('', Validators.required),
      pais_origen: new FormControl('', Validators.required),
      ano_fundacion: new FormControl('', Validators.required),
      sitio_web: new FormControl('', Validators.required),
    });
  }
  saveDistribuidor() {
    if (!this.distribuidorform.valid) {
      this.alerta.error("Formulario Inválido", "Rellene todos los campos");
      return;
    }
    try {
      const distri: Distribuidor = this.distribuidorform.value
      this.service.addDisitribuidor(distri);
      this.alerta.success("Distribuidor creado", "El distribuidor se guardó correctamente");

    } catch (error) {
      this.alerta.error("Error", "Error al guardar el distribuidor");
    }
  }
  cerrarModal() {
    this.cerrar.emit();
  }
}
