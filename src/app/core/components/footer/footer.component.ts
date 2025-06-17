import { Component } from '@angular/core';
import { TemaService } from '../../../cliente/features/movies/services/tema.service';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  modoOscuro = true;

  constructor(private temaService: TemaService) {
    this.temaService.modoOscuro$.subscribe(modo => {
      this.modoOscuro = modo;
    });
  }
}
