import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Pelicula } from '../../models/pelicula.model';
import { PeliculaService } from '../../../services/pelicula.service';

@Component({
  selector: 'app-listar-pelicula',
  imports: [CommonModule],
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
     this.peliculaService.obtenerPeliculas().subscribe({
      next: (data) => {
        this.peliculas = data;
        console.log('Películas:', this.peliculas);
      },
      error: (error) => {
        console.error('Error al obtener películas', error);
      },
    });
  }
}
