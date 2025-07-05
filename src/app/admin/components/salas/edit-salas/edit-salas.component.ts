import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SalasService } from '../../../../services/salas.service';
import { AlertaService } from '../../../../services/alerta.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Sala } from '../../../models/salas.model';

@Component({
  selector: 'app-edit-salas',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,RouterModule],
  templateUrl: './edit-salas.component.html',
  styleUrl: './edit-salas.component.css'
})
export class EditSalasComponent implements OnInit {
  editSalaForm: FormGroup;
  asientosPorFila = 10;
  vistaPrevia: { letra: string, asientos: number[] }[] = [];
  asientosNoUtilizados: string[] = [];
  idSala!: number;

  constructor(
    private fb: FormBuilder,
    private salaService: SalasService,
    private alerta: AlertaService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.editSalaForm = this.fb.group({
      nombre: ['', Validators.required],
      tipo_sala: [''],
      cantidad_asientos: [0, [Validators.required, Validators.min(2)]],
      espacios: ['']
    });
  }

  ngOnInit(): void {
    this.idSala = Number(this.route.snapshot.paramMap.get('id'));
    if (this.idSala) {
      this.cargarSala();
    }
  }

  cargarSala() {
    this.salaService.getSalaById(this.idSala).subscribe({
      next: (sala: Sala) => {
        this.editSalaForm.patchValue({
          nombre: sala.nombre,
          tipo_sala: sala.tipo_sala,
          cantidad_asientos: sala.cantidad_asientos,
        });

        // Cargar espacios no utilizados
        this.asientosNoUtilizados = sala.espacios.map(e => `${e.fila}${e.columna}`);
        this.actualizarJSON();

        // Generar vista previa
        this.generarVistaPrevia(sala.cantidad_asientos);
      },
      error: err => {
        this.alerta.error('Error','No se pudo cargar la sala.');
        this.router.navigate(['/admin/list-sala']);
      }
    });
  }

  onSubmit() {
    if (this.editSalaForm.valid) {
      const datos = {
        ...this.editSalaForm.value,
        espacios: this.asientosNoUtilizados.map(codigo => {
          return {
            fila: codigo.charAt(0),
            columna: parseInt(codigo.slice(1), 10)
          };
        })
      };
      this.salaService.updateSala(this.idSala, datos).subscribe({
        next: () => {
          this.alerta.success('Exito','Sala actualizada correctamente');
          this.router.navigate(['/admin/list-sala']);
        },
        error: () => {
          this.alerta.error('Error','Hubo un error al actualizar la sala');
        }
      });
    } else {
      this.editSalaForm.markAllAsTouched();
    }
  }

  onCantidadAsientosChange() {
    const cantidad = this.editSalaForm.get('cantidad_asientos')?.value || 0;
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
    this.editSalaForm.patchValue({
      espacios: JSON.stringify(this.asientosNoUtilizados, null, 2)
    });
  }

  limpiarEspacios() {
    this.asientosNoUtilizados = [];
    this.actualizarJSON();
  }
}
