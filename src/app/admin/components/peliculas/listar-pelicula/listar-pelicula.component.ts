import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Pelicula } from '../../../models/pelicula.model';
import { PeliculaService } from '../../../../services/pelicula.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-listar-pelicula',
  imports: [CommonModule,RouterLink],
  templateUrl: './listar-pelicula.component.html',
  styleUrl: './listar-pelicula.component.css'
})
export class ListarPeliculaComponent {
  peliculas: Pelicula[] = [];
  constructor(private peliculaService: PeliculaService) { }

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
  }
}
