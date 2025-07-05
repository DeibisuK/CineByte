import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Pelicula } from '../../../models/pelicula.model';
import { PeliculaService } from '../../../../services/pelicula.service';
import { RouterLink } from '@angular/router';
import { Idiomas } from '../../../models/idiomas.model';
import { IdiomasService } from '../../../../services/idiomas.service';
import { ActoresService } from '../../../../services/actores.service';
import { EtiquetasService } from '../../../../services/etiquetas.service';
import { DistribuidorService } from '../../../../services/distribuidor.service';
import Swal from 'sweetalert2';
import { Distribuidor } from '../../../models/distribuidor.model';

@Component({
  selector: 'app-listar-pelicula',
  imports: [CommonModule, RouterLink],
  templateUrl: './listar-pelicula.component.html',
  styleUrl: './listar-pelicula.component.css',
})
export class ListarPeliculaComponent {
  peliculas: Pelicula[] = [];

  constructor(
    private peliculaService: PeliculaService
  ) {}

  ngOnInit(): void {
    this.obtenerPeliculas();
  }
  obtenerPeliculas(): void {
    this.peliculaService.getPeliculasCompletas().subscribe({
      next: (data) => {
        this.peliculas = data;
        console.log('Peliculas obtenidas:', this.peliculas);
      },
      error: (error) => {
        console.error('Error al obtener películas', error);
      },
    });
  }

  tipoEstado(tipo: string): string {
    if (tipo === 'proximamente') {
      return 'Proximamente';
    } else if (tipo === 'activo') {
      return 'Activo';
    }
    return 'Retirado';
  }

  eliminarPelicula(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la pelicula permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.peliculaService.deletePelicula(id).subscribe({
          next: (res) => {
            Swal.fire('Eliminado', res.mensaje, 'success');
            this.obtenerPeliculas();
          },
          error: (err) => {
            const mensaje =
              err.error?.error || 'No se pudo eliminar la pelicula.';
            Swal.fire('Error', mensaje, 'error');
          },
        });
      }
    });
  }

  toStringArray(arr: number[] | string[]): string[] {
  return arr.map(x => x.toString());
}
}
