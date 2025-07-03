import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-crear-salas',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './crear-salas.component.html',
  styleUrl: './crear-salas.component.css'
})
export class CrearSalasComponent {
  crearSalaForm: FormGroup;
  asientosPorFila = 10;
  vistaPrevia: { letra: string, asientos: number[] }[] = [];
  asientosNoUtilizados: string[] = [];

  constructor(private fb: FormBuilder) {
    this.crearSalaForm = this.fb.group({
      nombre: ['', Validators.required],
      tipo_sala: [''],
      cantidad_asientos: [0, [Validators.required, Validators.min(2)]],
      espacios: ['']
    });
  }

  onCantidadAsientosChange() {
    const cantidad = this.crearSalaForm.get('cantidad_asientos')?.value || 0;
    this.asientosNoUtilizados = [];
    this.generarVistaPrevia(cantidad);
    this.actualizarJSON();
  }

  generarVistaPrevia(cantidad: number) {
    this.vistaPrevia = [];

    const filas = Math.ceil(cantidad / this.asientosPorFila);

    for (let fila = 0; fila < filas; fila++) {
      const letra = String.fromCharCode(65 + fila);
      const inicio = fila * this.asientosPorFila + 1;
      const final = Math.min(inicio + this.asientosPorFila - 1, cantidad);
      const asientos = [];

      for (let i = inicio; i <= final; i++) {
        asientos.push(i);
      }

      this.vistaPrevia.push({ letra, asientos });
    }
  }

  toggleAsiento(letra: string, numero: number) {
    const codigo = `${letra}${numero}`;
    const index = this.asientosNoUtilizados.indexOf(codigo);

    if (index >= 0) {
      this.asientosNoUtilizados.splice(index, 1);
    } else {
      this.asientosNoUtilizados.push(codigo);
    }

    this.actualizarJSON();
  }

  asientoEsInactivo(letra: string, numero: number): boolean {
    return this.asientosNoUtilizados.includes(`${letra}${numero}`);
  }

  actualizarJSON() {
    this.crearSalaForm.patchValue({
      espacios: JSON.stringify(this.asientosNoUtilizados, null, 2)
    });
  }

  limpiarEspacios() {
    this.asientosNoUtilizados = [];
    this.actualizarJSON();
  }

  onSubmit() {
    if (this.crearSalaForm.valid) {
      const datos = this.crearSalaForm.value;
      datos.espacios = this.asientosNoUtilizados;
      console.log('Datos de la sala:', datos);
      alert('Sala creada exitosamente!\n\nDatos:\n' + JSON.stringify(datos, null, 2));
    } else {
      this.crearSalaForm.markAllAsTouched();
    }
  }

  limpiarFormulario() {
    this.crearSalaForm.reset();
    this.vistaPrevia = [];
    this.limpiarEspacios();
  }
}
