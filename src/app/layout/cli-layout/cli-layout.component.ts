import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule, ViewportScroller } from '@angular/common';
import { FooterComponent } from '../../core/components/footer/footer.component';
import { ScrollTopComponent } from '../../core/components/scroll-top/scroll-top.component';
import { AnuncioComponent } from '../../core/components/anuncio/anuncio.component';
import { LoadingComponent } from '../../core/components/loading/loading.component';
import { Anuncio } from '@core/models';
import { AnuncioService } from '@core/services';
import { NavbarComponent } from '@core/components/navbar/navbar.component';

@Component({
  selector: 'app-cli-layout',
  imports: [
    RouterOutlet,
    NavbarComponent,
    AnuncioComponent,
    LoadingComponent,
    CommonModule,
    ScrollTopComponent,
    FooterComponent,
    CommonModule,
  ],
  templateUrl: './cli-layout.component.html',
  styleUrl: './cli-layout.component.css',
})
export class CliLayoutComponent implements OnInit {
  title = 'Cinebyte';
  anuncioActivo: Anuncio | null = null;
  mostrarAnuncio = false;
  modoOscuro = false;

  // Variables para el loading
  isLoading = true;
  fadeOutLoading = false;

  constructor(
    private router: Router,
    private viewportScroller: ViewportScroller,
    private anuncioService: AnuncioService
  ) {}

  ngOnInit() {
    this.cargarAnuncioActivo();
    this.setupRouterEvents();
    this.inicializarPagina();
  }

  setupRouterEvents() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Desplazar al inicio de la página
        this.viewportScroller.scrollToPosition([0, 0]);
      }
    });
  }

  inicializarPagina() {
    // Simular tiempo de carga de elementos críticos
    setTimeout(() => {
      this.fadeOutLoading = true;

      // Después del fade out, ocultar completamente el loading
      setTimeout(() => {
        this.isLoading = false;
      }, 500); // Tiempo del fade out
    }, 1500); // Tiempo mínimo de loading
  }

  cargarAnuncioActivo() {
    this.anuncioService.getAnuncioActivo().subscribe((anuncio) => {
      this.anuncioActivo = anuncio;
      this.mostrarAnuncio = !!anuncio;
    });
  }

  onCerrarAnuncio() {
    this.mostrarAnuncio = false;
    // Opcional: Guardar en localStorage que el usuario cerró el anuncio
    if (this.anuncioActivo) {
      localStorage.setItem(`anuncio_${this.anuncioActivo.id}_cerrado`, 'true');
    }
  }
}
