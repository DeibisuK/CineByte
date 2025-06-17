import { Component } from '@angular/core';
import { Movie } from '../../../../../core/models/movie.model';
import { MovieService } from '../../services/movie.service';
import { MovieNavigationService } from '../../services/navigation.service';
import { CommonModule } from '@angular/common';
import { EdadesComponent } from '../../../../../shared/components/edades/edades.component';

@Component({
  selector: 'app-catalogo',
  imports: [CommonModule,EdadesComponent],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css'
})
export class CatalogoComponent {
  peliculas: Movie[] = [];
  peliculasFiltradas: Movie[] = [];
  hoveredIndex: number = -1;

  menuActivo: 'formato' | 'genero' | 'idioma' = 'formato';
  menuAbierto = false;

  filtros: { [key: string]: string[] } = {
    formato: [],
    genero: [],
    idioma: []
  };

  filtroActivo: { [key: string]: string[] } = {
    formato: [],
    genero: [],
    idioma: []
  };

  constructor(private moviesService: MovieService, private movieNav: MovieNavigationService) {}

  ngOnInit(): void {
    this.moviesService.getAllMovies().subscribe((peliculas: Movie[]) => {
      this.peliculas = peliculas;
      this.peliculasFiltradas = peliculas;

      this.filtros['formato'] = [...new Set(peliculas.flatMap(p => p.etiqueta))];
      this.filtros['genero'] = [...new Set(peliculas.flatMap(p => p.generos))];
      this.filtros['idioma'] = [...new Set(peliculas.flatMap(p => p.idiomas))];
    });
  }

  toggleFiltro(categoria: string, valor: string): void {
    const index = this.filtroActivo[categoria].indexOf(valor);
    if (index > -1) {
      this.filtroActivo[categoria].splice(index, 1);
    } else {
      this.filtroActivo[categoria].push(valor);
    }
    // NO filtrar aquí
  }

  aplicarFiltros(): void {
    this.peliculasFiltradas = this.peliculas.filter(pelicula => {
      const cumpleFormato =
        this.filtroActivo['formato'].length === 0 ||
        this.filtroActivo['formato'].some(f => pelicula.etiqueta.includes(f));

      const cumpleGenero =
        this.filtroActivo['genero'].length === 0 ||
        this.filtroActivo['genero'].some(g => pelicula.generos.includes(g));

      const cumpleIdioma =
        this.filtroActivo['idioma'].length === 0 ||
        this.filtroActivo['idioma'].some(i => pelicula.idiomas.includes(i));

      return cumpleFormato && cumpleGenero && cumpleIdioma;
    });

    this.cerrarMenu(); // Cierra el menú luego de aplicar
  }

  cambiarMenu(menu: 'formato' | 'genero' | 'idioma') {
    if (this.menuActivo === menu && this.menuAbierto) {
      this.menuAbierto = false;
    } else {
      this.menuActivo = menu;
      this.menuAbierto = true;
    }
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }

  // Añade este método para saber si hay filtros activos
  get hayFiltrosActivos(): boolean {
    return (
      this.filtroActivo['formato'].length > 0 ||
      this.filtroActivo['genero'].length > 0 ||
      this.filtroActivo['idioma'].length > 0
    );
  }
  
  // Limpia todos los filtros activos
  limpiarFiltros(): void {
    this.filtroActivo = { formato: [], genero: [], idioma: [] };
    this.aplicarFiltros();
  }
  
  // Quita un filtro individual
  quitarFiltro(categoria: string, valor: string): void {
    const idx = this.filtroActivo[categoria].indexOf(valor);
    if (idx > -1) {
      this.filtroActivo[categoria].splice(idx, 1);
      this.aplicarFiltros();
    }
  }

  verDetalle(movie: Movie) {
    this.movieNav.verDetalle(movie);
  }
}
