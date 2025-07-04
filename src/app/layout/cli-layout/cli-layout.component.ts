import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../core/components/footer/footer.component';
import { ScrollTopComponent } from '../../core/components/scroll-top/scroll-top.component';
import { AnuncioComponent } from '../../core/components/anuncio/anuncio.component';
import { Anuncio } from '../../admin/models/anuncio.model';
import { AnuncioService } from '../../services/anuncio.service';

@Component({
  selector: 'app-cli-layout',
  imports: [RouterOutlet,NavbarComponent,
    AnuncioComponent,CommonModule,
  ScrollTopComponent,FooterComponent,CommonModule],
  templateUrl: './cli-layout.component.html',
  styleUrl: './cli-layout.component.css'
})
export class CliLayoutComponent implements OnInit {
  title = 'Cinebyte';
  anuncioActivo: Anuncio | null = null;
  mostrarAnuncio = false;
  modoOscuro = false;

  constructor(private anuncioService: AnuncioService) {}

  ngOnInit() {
    this.cargarAnuncioActivo();
  }

  cargarAnuncioActivo() {
    this.anuncioService.getAnuncioActivo().subscribe(anuncio => {
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