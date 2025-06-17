import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnuncioComponent } from './core/components/anuncio/anuncio.component';
import { CommonModule } from '@angular/common';
import { ScrollTopComponent } from './core/components/scroll-top/scroll-top.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { NavbarComponent } from './core/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,NavbarComponent,
    AnuncioComponent,CommonModule,
  ScrollTopComponent,FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Cinebyte';
  mostrarAnuncio = true;
  modoOscuro = false;

  onCerrarAnuncio() {
    this.mostrarAnuncio = false;
  }
}
