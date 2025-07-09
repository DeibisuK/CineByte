import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarouselEstrenosComponent } from '../carousel-estrenos/carousel-estrenos.component';
import { Pelicula } from '../../../../../admin/models/pelicula.model';
import { PeliculaService } from '../../../../../services/pelicula.service';

@Component({
  selector: 'app-detalle-pelicula',
  imports: [CommonModule,CarouselEstrenosComponent,RouterModule],
  templateUrl: './detalle-pelicula.component.html',
  styleUrl: './detalle-pelicula.component.css'
})
export class DetallePeliculaComponent {
  pelicula?: Pelicula;
  cantidad = 1;
  idiomaSeleccionado: string = '';
  mostrarTrailer = false;
  safeTrailerUrl?: SafeResourceUrl;
  funcionesPorIdioma: { idioma: string; horarios: string[]; trailer: string; precio: number }[] = [];

  constructor(
    private route: ActivatedRoute,
    public sanitizer: DomSanitizer,
    private movieService: PeliculaService,
    private router: Router
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.movieService.getFuncionesByPeliculaId(id).subscribe({
      next: (response) => {
        // Ahora la API retorna un array de funciones individuales
        const funcionesIndividuales = response || [];
        
        // Agrupar funciones por idioma
        const funcionesAgrupadas = this.agruparFuncionesPorIdioma(funcionesIndividuales);
        
        this.funcionesPorIdioma = funcionesAgrupadas;

        if (this.funcionesPorIdioma.length > 0) {
          this.idiomaSeleccionado = this.funcionesPorIdioma[0].idioma;
          
          // Convertir la URL de YouTube a formato embed antes de sanitizar
          const embedUrl = this.convertToEmbedUrl(this.funcionesPorIdioma[0].trailer);
          this.safeTrailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
        }
      },
      error: (err) => {
        console.warn(`❌ No se encontraron funciones para la película con ID ${id}:`, err.status);
        // Inicializar arrays vacíos cuando no hay funciones
        this.funcionesPorIdioma = [];
        this.idiomaSeleccionado = '';
        this.safeTrailerUrl = undefined;
      }
    });

    this.movieService.getPeliculaById(id).subscribe({
      next: (pelicula) => {
        this.pelicula = pelicula;
      },
      error: (err) => {
        console.error('Error fetching pelicula:', err);
        // Optionally, display an error message to the user
      }
    });
  }

  cambiarCantidad(delta: number) {
    if (this.cantidad + delta >= 1) {
      this.cantidad += delta;
    }
  }

  abrirTrailer() {
    this.mostrarTrailer = true;
  }

  cerrarTrailer() {
    this.mostrarTrailer = false;
  }

  irASiguiente() {
    this.router.navigate(['/compra', this.pelicula?.titulo]);
  }

  obtenerHorariosPorIdioma(): string[] {
    if (!this.funcionesPorIdioma || this.funcionesPorIdioma.length === 0) {
      return [];
    }
    
    const funciones = this.funcionesPorIdioma.find(
      (f) => f.idioma === this.idiomaSeleccionado
    );
    
    return funciones ? funciones.horarios : [];
  }

  obtenerPrecioPorIdioma(): number | string {
    if (!this.funcionesPorIdioma || this.funcionesPorIdioma.length === 0) {
      return 'No disponible';
    }
    
    const funcion = this.funcionesPorIdioma.find(f => f.idioma === this.idiomaSeleccionado);
    
    return funcion && funcion.precio ? funcion.precio : 'N/A';
  }

  /**
   * Agrupa funciones individuales por idioma y crea el formato esperado
   */
  private agruparFuncionesPorIdioma(funcionesIndividuales: any[]): { idioma: string; horarios: string[]; trailer: string; precio: number }[] {
    // Agrupar por idioma
    const grupos: { [idioma: string]: any[] } = {};
    
    funcionesIndividuales.forEach(funcion => {
      const idioma = funcion.idioma;
      if (!grupos[idioma]) {
        grupos[idioma] = [];
      }
      grupos[idioma].push(funcion);
    });
    
    // Convertir a formato esperado
    const resultado = Object.keys(grupos).map(idioma => {
      const funcionesDelIdioma = grupos[idioma];
      
      // Extraer horarios (solo la hora de fecha_hora_inicio)
      const horarios = funcionesDelIdioma.map(f => {
        const fecha = new Date(f.fecha_hora_inicio);
        return fecha.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      });
      
      // Usar datos de la primera función del idioma para trailer y precio
      const primeraFuncion = funcionesDelIdioma[0];
      
      return {
        idioma: idioma,
        horarios: horarios,
        trailer: primeraFuncion.trailer_url,
        precio: primeraFuncion.precio || 0
      };
    });
    
    return resultado;
  }

  /**
   * Convierte una URL de YouTube a formato embed
   */
  private convertToEmbedUrl(url: string): string {
    if (!url) return '';
    
    // Extraer el ID del video de diferentes formatos de URL de YouTube
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      const videoId = match[2];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    return url; // Si no es una URL de YouTube válida, devolver la original
  }

  /**
   * Cambia el idioma seleccionado y actualiza el trailer URL
   */
  cambiarIdioma(idioma: string, trailerUrl: string) {
    this.idiomaSeleccionado = idioma;
    const embedUrl = this.convertToEmbedUrl(trailerUrl);
    this.safeTrailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}
