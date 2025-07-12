import { Component, OnDestroy, OnInit } from '@angular/core';
import { MovieNavigationService } from '../../services/navigation.service';
import { CommonModule } from '@angular/common';
import { EdadesComponent } from '../../../../../shared/components/edades/edades.component';
import { RouterModule } from '@angular/router';
import { Pelicula } from '@core/models/pelicula.model';
import { PeliculaService } from '@features/movies/services/pelicula.service';

@Component({
  selector: 'app-catalogo',
  imports: [CommonModule,EdadesComponent,RouterModule],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css'
})
export class CatalogoComponent implements OnInit, OnDestroy {
  peliculas: Pelicula[] = [];
  peliculasFiltradas: Pelicula[] = [];
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

  // Loading state
  loading: boolean = true;

  constructor(private peliculaService: PeliculaService, private movieNav: MovieNavigationService) {}

  ngOnInit(): void {
    this.loading = true;
    this.peliculaService.getPeliculasCompletas().subscribe({
      next: (peliculas: Pelicula[]) => {
        this.peliculas = peliculas;
        this.peliculasFiltradas = peliculas;

        this.filtros['formato'] = [...new Set(peliculas.flatMap((p: any) => this.toStringArray(p.etiquetas)))] as string[];
        this.filtros['genero'] = [...new Set(peliculas.flatMap((p: any) => this.toStringArray(p.generos)))] as string[];
        this.filtros['idioma'] = [...new Set(peliculas.flatMap((p: any) => this.toStringArray(p.idiomas)))] as string[];
        
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar películas:', error);
        this.loading = false;
      }
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
        this.filtroActivo['formato'].some(f => this.toStringArray(pelicula.etiquetas).includes(f));

      const cumpleGenero =
        this.filtroActivo['genero'].length === 0 ||
        this.filtroActivo['genero'].some(g => this.toStringArray(pelicula.generos).includes(g));

      const cumpleIdioma =
        this.filtroActivo['idioma'].length === 0 ||
        this.filtroActivo['idioma'].some(i => this.toStringArray(pelicula.idiomas).includes(i));

      return cumpleFormato && cumpleGenero && cumpleIdioma;
    });

    this.cerrarMenu(); // Cierra el menú luego de aplicar
  }

  cambiarMenu(menu: 'formato' | 'genero' | 'idioma') {
    if (this.menuActivo === menu && this.menuAbierto) {
      this.menuAbierto = false;
      this.removerClaseMenuAbierto();
    } else {
      this.menuActivo = menu;
      this.menuAbierto = true;
      this.agregarClaseMenuAbierto();
    }
  }

  cerrarMenu() {
    this.menuAbierto = false;
    this.removerClaseMenuAbierto();
  }

  // Métodos para controlar el scroll del body
  private agregarClaseMenuAbierto(): void {
    document.body.classList.add('menu-abierto');
  }

  private removerClaseMenuAbierto(): void {
    document.body.classList.remove('menu-abierto');
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

  verDetalle(movie: Pelicula) {
    this.movieNav.verDetalle(movie);
  }

   /**
   * Convierte un array de números o strings a un array de strings, 
   * o extrae la propiedad 'nombre' si son objetos
   * @param arr Array de números, strings u objetos
   * @returns Array de strings
   */
  toStringArray(arr: any[]): string[] {
    if (!arr || !Array.isArray(arr)) return [];
    
    return arr.map(item => {
      if (typeof item === 'object' && item !== null && 'nombre' in item) {
        return item.nombre.toString();
      }
      return item.toString();
    });
  }

  ngOnDestroy(): void {
    this.removerClaseMenuAbierto();
  }
}
