import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostBinding, Inject, Input, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Movie } from '../../models/movie.model';
import { MovieService } from '../../../cliente/features/movies/services/movie.service';
import { TemaService } from '../../../cliente/features/movies/services/tema.service';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from '../../../acceso/login/login.component';
import { Sede, SedeService } from '../../../services/sede.service';
import { AuthService } from '../../../services/AuthService';
import { Users } from '../../models/user.model';
import { User } from 'firebase/auth';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-navbar',
  imports: [CommonModule, FormsModule, LoginComponent, RouterLink, RouterLinkActive],
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
  esNavegador = false;
  menuSedesAbierto = false;
  sedeSeleccionada: Sede | null = null;
  sedes: Sede[] = [];
  ciudadesConSedes: { nombre: string, sedes: Sede[] }[] = [];
  usuario: User | null = null;
  timeoutAbierto: any;
  timeoutCerrado: any;

  ciudades = [
    { value: 'Machala', label: 'Machala' },
    { value: 'Guayaquil', label: 'Guayaquil' },
    { value: 'Quito', label: 'Quito' }
  ];

  @HostBinding('class') className = '';

  constructor(
    private router: Router,
    private movieService: MovieService,
    private sedeService: SedeService, // <-- Asegúrate de inyectar el servicio
    @Inject(PLATFORM_ID) private plataforma: Object,
    private temaService: TemaService,
    private authService: AuthService
  ) {
    this.esNavegador = isPlatformBrowser(this.plataforma);
  }

  ngOnInit(): void {
    if (this.esNavegador) {
      const temaGuardado = localStorage.getItem('tema');
      this.modoOscuro = temaGuardado !== 'claro';
      this.aplicarTema(this.modoOscuro);
    }
    this.cargarSedes();
    this.authService.role$.subscribe(() => {
      this.usuario = this.authService.getUsuarioActual();
    });

  }

  cargarSedes() {
    this.sedeService.getSedes().subscribe(sedes => {
      this.sedes = sedes;
      this.ciudadesConSedes = this.agruparSedesPorCiudad(sedes);
    });
  }

  agruparSedesPorCiudad(sedes: Sede[]) {
    const ciudadesMap: { [id: number]: { nombre: string, sedes: Sede[] } } = {};
    for (const sede of sedes) {
      const ciudadId = sede.id_ciudad;
      const ciudadNombre = this.getNombreCiudad(ciudadId);
      if (!ciudadesMap[ciudadId]) {
        ciudadesMap[ciudadId] = { nombre: ciudadNombre, sedes: [] };
      }
      ciudadesMap[ciudadId].sedes.push(sede);
    }
    return Object.values(ciudadesMap);
  }

  getNombreCiudad(id: number): string {
    // Puedes usar tu ciudadesMap o traerlo del backend
    const ciudadesMap: { [id: number]: string } = {
      1: 'Quito',
      2: 'Guayaquil',
      3: 'Cuenca',
      4: 'Manta',
      5: 'Machala',
      6: 'Ambato',
      7: 'Riobamba',
      8: 'Loja',
      9: 'Ibarra',
      10: 'Esmeraldas',
      11: 'Babahoyo',
      12: 'Santa Elena',
      13: 'Santo Domingo'
    };
    return ciudadesMap[id] || 'Ciudad';
  }

  abrirMenuSedes() {
    this.menuSedesAbierto = !this.menuSedesAbierto;
  }

  seleccionarSede(sede: Sede) {
    this.sedeSeleccionada = sede;
    this.menuSedesAbierto = false;
    // Aquí puedes guardar la sede seleccionada en localStorage o emitir un evento
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

  truncateUsername(name: string | null, limit: number = 12): string {
    if (!name) return 'Usuario';
    return name.length > limit ? name.substring(0, limit) + '...' : name;
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
  verPerfil() {
    this.router.navigate(['/perfil']);
  }

  async cerrarSesion() {
    this.menuAbierto = false;
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await this.authService.logout();
        await Swal.fire('Cerraste sesión', '', 'success');
        this.router.navigate(['/']);
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo cerrar la sesión', 'error');
      }
    }
  }

}
