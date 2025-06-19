import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostBinding, Inject, Input, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Movie } from '../../models/movie.model';
import { MovieService } from '../../../cliente/features/movies/services/movie.service';
import { TemaService } from '../../../cliente/features/movies/services/tema.service';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from '../../../acceso/login/login.component';

@Component({
  selector: 'app-navbar',
<<<<<<< HEAD
  imports: [CommonModule, FormsModule,LoginComponent, RouterLink],
  imports: [CommonModule, FormsModule,LoginComponent,RouterLink],
>>>>>>> 84b3e474325c9f8b78943741f3c1ffa44139d46b
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @Input() anuncioVisible = false;
  modoOscuro = true;
  invertirLogo = false;
  menuAbierto = false;
  menuCerrando = false;
  busqueda = '';
  ubicacion = 'Machala';
  esNavegador = false;

  ciudades = [
    { value: 'Machala', label: 'Machala' },
    { value: 'Guayaquil', label: 'Guayaquil' },
    { value: 'Quito', label: 'Quito' }
  ];

  @HostBinding('class') className = '';

  constructor(
    private router: Router,
    private movieService: MovieService,
    @Inject(PLATFORM_ID) private plataforma: Object,
    private temaService: TemaService
  ) {
    this.esNavegador = isPlatformBrowser(this.plataforma);
  }

  ngOnInit(): void {
    if (this.esNavegador) {
      const temaGuardado = localStorage.getItem('tema');
      this.modoOscuro = temaGuardado !== 'claro';
      this.aplicarTema(this.modoOscuro);
    }
  }

  cambiarTema(): void {
    this.modoOscuro = !this.modoOscuro;
    this.aplicarTema(this.modoOscuro);
    this.temaService.setModoOscuro(this.modoOscuro);

    if (this.esNavegador) {
      localStorage.setItem('tema', this.modoOscuro ? 'oscuro' : 'claro');
    }
  }

  aplicarTema(oscuro: boolean): void {
    if (!this.esNavegador) return;

    const body = document.body;
    if (oscuro) {
      body.classList.remove('light-mode');
      this.invertirLogo = false;
    } else {
      body.classList.add('light-mode');
      this.invertirLogo = true;
    }
  }

  buscarPelicula(): void {
    const termino = this.busqueda.trim();
    if (termino.length > 0) {
      const pelicula: Movie | undefined = this.movieService.searchMovie(termino);
      if (pelicula) {
        const tituloUrl = pelicula.titulo
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9\-]/g, '');
        this.router.navigate(['/pelicula', pelicula.id, tituloUrl]);
      } else {
        const terminoUrl = termino
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9\-]/g, '');
        this.router.navigate(['/buscar', terminoUrl]);
      }
      this.busqueda = '';
      if (this.menuAbierto) {
        this.navegarCerrarMenu();
      }
    }
  }
  cerrarMenu() {
    this.menuCerrando = true;
    setTimeout(() => {
      this.menuAbierto = false;
      this.menuCerrando = false;
    }, 250); // Debe coincidir con la duración de la animación
  }

  navegarCerrarMenu() {
    this.cerrarMenu();
  }

  showLoginModal = false; // Esta variable controla la visibilidad del componente de login

  openLoginModal() {
    this.showLoginModal = true;
  }

  closeLoginModal() {
    this.showLoginModal = false;
  }
}
