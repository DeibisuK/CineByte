import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../core/components/footer/footer.component';
import { ScrollTopComponent } from '../../core/components/scroll-top/scroll-top.component';
import { AnuncioComponent } from '../../core/components/anuncio/anuncio.component';

@Component({
  selector: 'app-cli-layout',
  imports: [RouterOutlet,NavbarComponent,
    AnuncioComponent,CommonModule,
  ScrollTopComponent,FooterComponent,CommonModule],
  templateUrl: './cli-layout.component.html',
  styleUrl: './cli-layout.component.css'
})
export class CliLayoutComponent {
  title = 'Cinebyte';
  mostrarAnuncio = true;
  modoOscuro = false;

  onCerrarAnuncio() {
    this.mostrarAnuncio = false;
  }
}
