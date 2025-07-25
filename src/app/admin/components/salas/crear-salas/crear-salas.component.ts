import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SalasService } from '@features/venues/services/salas.service';
import { Espacio, Sala } from '@core/models/salas.model';
import { AlertaService } from '@core/services';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-crear-salas',
  imports: [ReactiveFormsModule, CommonModule,RouterModule],
  templateUrl: './crear-salas.component.html',
  styleUrl: './crear-salas.component.css'
})
export class CrearSalasComponent {
  crearSalaForm: FormGroup;
  asientosPorFila = 10;
  vistaPrevia: { letra: string, asientos: number[] }[] = [];
  asientosNoUtilizados: string[] = [];

  constructor(private fb: FormBuilder, private salaService: SalasService,private alerta:AlertaService, private router: Router) {
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
      const asientosEnEstaFila = Math.min(this.asientosPorFila, cantidad - (fila * this.asientosPorFila));
      const asientos = [];

      // Cada fila comienza desde 1 hasta el máximo de asientos por fila (10) o los restantes
      for (let i = 1; i <= asientosEnEstaFila; i++) {
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
      const valores = this.crearSalaForm.value;

      // Convertir ['A1', 'B4'] -> [{ fila: 'A', columna: 1 }, ...]
      const espaciosFormateados: Espacio[] = this.asientosNoUtilizados.map(code => {
        const fila = code.charAt(0);
        const columna = parseInt(code.slice(1), 10);
        return { fila, columna };
      });

      const sala: Sala = {
        nombre: valores.nombre,
        tipo_sala: valores.tipo_sala,
        cantidad_asientos: valores.cantidad_asientos,
        espacios: espaciosFormateados
      };

      console.log('Sala a crear:', sala);
      
      this.salaService.addSala(sala).subscribe({
       next: () => {
          this.alerta.success('Exito','Sala creada correctamente');
          this.router.navigate(['/admin/salas/list']);
        },
        error: () => {
          this.alerta.error('Error','Hubo un error al crear la sala');
        }
      });
    } else {
      this.alerta.warning('Formulario','Necesitas rellenar todo el formulario');
      this.crearSalaForm.markAllAsTouched();
    }
  }


  limpiarFormulario() {
    this.crearSalaForm.reset();
    this.vistaPrevia = [];
    this.limpiarEspacios();
  }
}
