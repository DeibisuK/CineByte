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
        // La API retorna un array con un objeto que contiene el array de funciones
        const funcionesData = response[0]?.obtener_funciones_por_id_pelicula_formato_json || [];
        
        this.funcionesPorIdioma = funcionesData.map((f: any) => ({
          idioma: f.idioma,
          horarios: f.horarios,
          trailer: f.trailer_url,
          precio: f.precio || 0 // Valor por defecto si no viene precio
        }));

        if (this.funcionesPorIdioma.length > 0) {
          this.idiomaSeleccionado = this.funcionesPorIdioma[0].idioma;
          this.safeTrailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.funcionesPorIdioma[0].trailer
          );
        }
      },
      error: (err) => {
        console.error('Error fetching funciones:', err);
        // Optionally, display an error message to the user
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
    const funciones = this.funcionesPorIdioma.find(
      (f) => f.idioma === this.idiomaSeleccionado
    );
    return funciones ? funciones.horarios : [];
  }

  obtenerPrecioPorIdioma(): number | string {
    const funcion = this.funcionesPorIdioma.find(f => f.idioma === this.idiomaSeleccionado);
    return funcion && funcion.precio ? funcion.precio : 'N/A';
  }
}
