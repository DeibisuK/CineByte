import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostBinding, Inject, Input, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TemaService } from '../../../cliente/features/movies/services/tema.service';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from '../../../acceso/login/login.component';
import { Sede, SedeService } from '@features/venues/services/sede.service';
import { AuthService, LoginModalService } from '@core/services';
import { User } from 'firebase/auth';
import Swal from 'sweetalert2';
import { PeliculaService } from '@features/movies';
import { Pelicula } from '@core/models';


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
    private peliculaService: PeliculaService,
    private sedeService: SedeService, // <-- Asegúrate de inyectar el servicio
    @Inject(PLATFORM_ID) private plataforma: Object,
    private temaService: TemaService,
    private authService: AuthService,
    private loginModalService: LoginModalService
  ) {
    this.esNavegador = isPlatformBrowser(this.plataforma);
  }

  ngOnInit(): void {
    if (this.esNavegador) {
      const temaGuardado = localStorage.getItem('tema');
      this.modoOscuro = temaGuardado !== 'claro';
      this.aplicarTema(this.modoOscuro);
      
      // Cargar sede guardada en localStorage
      const sedeGuardada = localStorage.getItem('sedeSeleccionada');
      if (sedeGuardada) {
        this.sedeSeleccionada = JSON.parse(sedeGuardada);
      }
    }
    this.cargarSedes();
    this.authService.role$.subscribe(() => {
      this.usuario = this.authService.getUsuarioActual();
    });

    // Suscribirse al servicio del modal
    this.loginModalService.showModal$.subscribe(show => {
      this.showLoginModal = show;
    });
  }


  cargarSedes() {
    this.sedeService.getSedes().subscribe(sedes => {
      this.sedes = sedes;
      this.ciudadesConSedes = this.agruparSedesPorCiudad(sedes);

      navigator.geolocation.getCurrentPosition(
        position => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;

          let puntoMasCercano = this.sedes[0];
          let distanciaMinima = this.sedeService.calcularDistancia(userLat, userLon, this.sedes[0].latitud!, this.sedes[0].longitud!);


          for (const punto of this.sedes.slice(1)) {
            const distancia = this.sedeService.calcularDistancia(userLat, userLon, punto.latitud!, punto.longitud!);
            if (distancia < distanciaMinima) {
              distanciaMinima = distancia;
              puntoMasCercano = punto;
            }
          }
          this.sedeSeleccionada = puntoMasCercano;
        },
        error => {
          console.error('No se pudo obtener la ubicación:', error);
        }
      );
    });
  }

  agruparSedesPorCiudad(sedes: Sede[]) {
    const ciudadesMap: { [ciudad: string]: { nombre: string, sedes: Sede[] } } = {};

    for (const sede of sedes) {
      const ciudadNombre = sede.ciudad?.trim() || 'Sin ciudad';

      if (!ciudadesMap[ciudadNombre]) {
        ciudadesMap[ciudadNombre] = { nombre: ciudadNombre, sedes: [] };
      }

      ciudadesMap[ciudadNombre].sedes.push(sede);
    }

    return Object.values(ciudadesMap);
  }

  abrirMenuSedes() {
    this.menuSedesAbierto = !this.menuSedesAbierto;
  }

  seleccionarSede(sede: Sede) {
    this.sedeSeleccionada = sede;
    this.menuSedesAbierto = false;
    
    // Guardar la sede seleccionada en localStorage para otros componentes
    if (this.esNavegador) {
      localStorage.setItem('sedeSeleccionada', JSON.stringify(sede));
      
      // Emitir evento personalizado para que otros componentes puedan reaccionar
      window.dispatchEvent(new CustomEvent('sedeSeleccionada', {
        detail: sede
      }));
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
      this.peliculaService.buscarPelicula(termino).subscribe(pelicula => {
        if (pelicula) {
          const tituloUrl = pelicula.titulo
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-]/g, '');
          this.router.navigate(['/pelicula', pelicula.id_pelicula, tituloUrl]);
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
      });
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
    this.loginModalService.openModal();
  }

  closeLoginModal() {
    this.loginModalService.closeModal();
  }
  verPerfil() {
    this.router.navigate(['/perfil']);
  }

  esUsuarioAdmin(): boolean {
    if (!this.usuario) return false;
    
    // Verificar si el usuario tiene rol de admin
    const role = this.authService.getRole();
    return role === 'admin';
  }

  esUsuarioEmpleado(): boolean {
    if (!this.usuario) return false;
    
    // Verificar si el usuario tiene rol de empleado
    const role = this.authService.getRole();
    return role === 'empleado';
  }

  tieneAccesoAdministrativo(): boolean {
    return this.esUsuarioAdmin() || this.esUsuarioEmpleado();
  }

  irAModoAdmin() {
    this.menuAbierto = false;
    
    // Si es empleado, redirigir a películas/list (ruta por defecto)
    if (this.esUsuarioEmpleado() && !this.esUsuarioAdmin()) {
      this.router.navigate(['/admin/peliculas/list']);
    } else {
      // Si es admin, redirigir al admin general
      this.router.navigate(['/admin']);
    }
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
