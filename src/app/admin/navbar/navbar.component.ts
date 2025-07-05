import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/AuthService';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {

  sidebarClosed = false;
  modoOscuro = true;
  private mediaQuery: MediaQueryList;
  dropdownStates: { [key: string]: boolean } = {};
  cinesMenuOpen = false; // Nueva propiedad para el menú de cines
  dropdownOpen = false; // Nueva propiedad para el menú desplegable

  @Output() sidebarState = new EventEmitter<boolean>();

  constructor(private router: Router,private authService:AuthService) {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  }

  ngOnInit() {
    this.loadPreferences();

    this.applyTheme();

    this.mediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));

    // Auto-cerrar sidebar en móvil si se navega
    this.router.events.subscribe(() => {
      if (window.innerWidth <= 900) {
        this.sidebarClosed = true;
        this.sidebarState.emit(this.sidebarClosed);
      }
    });
  }

  ngOnDestroy() {
    this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange.bind(this));
  }

  // Escuchar cambios de tamaño de ventana
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth <= 900 && !this.sidebarClosed) {
      this.sidebarClosed = true;
      this.sidebarState.emit(this.sidebarClosed);
    }
    // Auto-abrir en desktop
    else if (event.target.innerWidth > 900 && this.sidebarClosed) {
      this.sidebarClosed = false;
      this.sidebarState.emit(this.sidebarClosed);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (window.innerWidth <= 900 && !this.sidebarClosed) {
      const target = event.target as HTMLElement;
      const sidebar = document.querySelector('.sidebar');
      const toggleBtn = document.querySelector('.toggle-btn');

      if (sidebar && !sidebar.contains(target) && !toggleBtn?.contains(target)) {
        this.sidebarClosed = true;
        this.sidebarState.emit(this.sidebarClosed);
      }
    }
  }

  toggleSidebar() {
    this.sidebarClosed = !this.sidebarClosed;
    this.sidebarState.emit(this.sidebarClosed);
    if (this.sidebarClosed) {
      Object.keys(this.dropdownStates).forEach(key => {
        this.dropdownStates[key] = false;
      });
    }
    localStorage.setItem('sidebarClosed', this.sidebarClosed.toString());

    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }

  // Cambiar tema con transición suave
  cambiarTema() {
    this.modoOscuro = !this.modoOscuro;
    this.applyTheme();
    this.savePreferences();

    // Animación de transición suave
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  }

  // Aplicar tema
  private applyTheme() {
    document.body.classList.toggle('light-mode', !this.modoOscuro);

    // Cambiar meta theme-color para móviles
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', this.modoOscuro ? '#121212' : '#ffffff');
    }
  }

  // Manejar cambios automáticos del sistema
  private handleSystemThemeChange(e: MediaQueryListEvent) {
    // Solo aplicar si el usuario no ha establecido una preferencia manual
    const hasUserPreference = localStorage.getItem('userThemePreference');
    if (!hasUserPreference) {
      this.modoOscuro = e.matches;
      this.applyTheme();
    }
  }

  // Cargar preferencias del usuario
  private loadPreferences() {
    try {
      const savedSidebarState = localStorage.getItem('sidebarClosed');
      const savedTheme = localStorage.getItem('modoOscuro');

      if (savedSidebarState !== null) {
        this.sidebarClosed = JSON.parse(savedSidebarState);
      }

      if (savedTheme !== null) {
        this.modoOscuro = JSON.parse(savedTheme);
        localStorage.setItem('userThemePreference', 'true');
      } else {
        // Usar preferencia del sistema si no hay preferencia guardada
        this.modoOscuro = this.mediaQuery.matches;
      }
    } catch (error) {
      console.warn('Error cargando preferencias:', error);
    }
  }

  // Guardar preferencias del usuario
  private savePreferences() {
    try {
      localStorage.setItem('sidebarClosed', JSON.stringify(this.sidebarClosed));
      localStorage.setItem('modoOscuro', JSON.stringify(this.modoOscuro));
      localStorage.setItem('userThemePreference', 'true');
    } catch (error) {
      console.warn('Error guardando preferencias:', error);
    }
  }

  // Logout con confirmación
  async logout() {
    const resultado = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    });

    if (resultado.isConfirmed) {
      try {
        await this.authService.logout();
        await Swal.fire('Sesión cerrada', 'Has salido correctamente.', 'success');
        this.router.navigate(['/']); // o a login o home
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudo cerrar la sesión.', 'error');
      }
    }
  }

  getSidebarState(): boolean {
    return this.sidebarClosed;
  }

  // Método para obtener el tema actual
  getThemeState(): boolean {
    return this.modoOscuro;
  }

  // Método para forzar el cierre del sidebar (útil para rutas específicas)
  forceSidebarClose() {
    if (!this.sidebarClosed) {
      this.sidebarClosed = true;
      this.sidebarState.emit(this.sidebarClosed);
    }
  }

  // Método para forzar la apertura del sidebar
  forceSidebarOpen() {
    if (this.sidebarClosed) {
      this.sidebarClosed = false;
      this.sidebarState.emit(this.sidebarClosed);
    }
  }

  // Método para alternar el estado del menú de cines
  toggleCines(): void {
    this.cinesMenuOpen = !this.cinesMenuOpen;
  }

  // Método para alternar el estado del menú desplegable
  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  // Método para alternar el estado del menú de Cines
  toggleCinesMenu() {
    this.cinesMenuOpen = !this.cinesMenuOpen;
  }

}
