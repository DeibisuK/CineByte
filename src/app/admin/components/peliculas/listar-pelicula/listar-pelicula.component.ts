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
  idiomaMap: { [id: number]: string } = {};
  tagsMap: { [id: number]: string } = {};
  actorsaMap: { [id: number]: string } = {};
  distribuidorMap: { [id: number]: string } = {};

  constructor(
    private peliculaService: PeliculaService,
    private idiomaService: IdiomasService,
    private actoresService: ActoresService,
    private etiquetasService: EtiquetasService,
    private distribuidoraService: DistribuidorService
  ) {}

  ngOnInit(): void {
    this.obtenerPeliculas();
  }
  obtenerPeliculas(): void {
    this.peliculaService.getPeliculas().subscribe({
      next: (data) => {
        this.peliculas = data;
      },
      error: (error) => {
        console.error('Error al obtener películas', error);
      },
    });
    this.cargarCategorias();
  }
  cargarCategorias(): void {
    this.idiomaService.getIdiomas().subscribe({
      next: (res) => {
        // construyes un mapa { id: nombre }
        this.idiomaMap = res.reduce((map, idioma) => {
          map[idioma.id_idioma] = idioma.nombre;
          return map;
        }, {} as { [id: number]: string });
      },
    });

    this.actoresService.getActor().subscribe({
      next: (res) => {
        // construyes un mapa { id: nombre }
        this.actorsaMap = res.reduce((map, actor) => {
          map[actor.id_actor] = actor.nombre;
          return map;
        }, {} as { [id: number]: string });
      },
    });

    this.etiquetasService.getEtiquetas().subscribe({
      next: (res) => {
        // construyes un mapa { id: nombre }
        this.tagsMap = res.reduce((map, tag) => {
          map[tag.id_etiqueta] = tag.nombre;
          return map;
        }, {} as { [id: number]: string });
      },
    });

    interface DistribuidorMap {
      [id: number]: string;
    }

    this.distribuidoraService.getDistribuidor().subscribe({
      next: (res: Distribuidor[]) => {
        this.distribuidorMap = res.reduce<DistribuidorMap>((map, tag) => {
          const id = Number(tag.id_distribuidora);
          if (!isNaN(id)) {
            map[id] = tag.nombre || '';
          }
          return map;
        }, {});
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
}
