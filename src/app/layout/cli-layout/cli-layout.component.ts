import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule, ViewportScroller } from '@angular/common';
import { FooterComponent } from '../../core/components/footer/footer.component';
import { ScrollTopComponent } from '../../core/components/scroll-top/scroll-top.component';
import { AnuncioComponent } from '../../core/components/anuncio/anuncio.component';
import { Anuncio } from '@core/models';
import { AnuncioService } from '@core/services';
import { NavbarComponent } from '@core/components/navbar/navbar.component';

@Component({
  selector: 'app-cli-layout',
  imports: [
    RouterOutlet,
    NavbarComponent,
    AnuncioComponent,
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

  constructor(
    private router: Router,
    private viewportScroller: ViewportScroller,
    private anuncioService: AnuncioService
  ) {}

  ngOnInit() {
    this.cargarAnuncioActivo();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Desplazar al inicio de la página
        this.viewportScroller.scrollToPosition([0, 0]);
      }
    });
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
