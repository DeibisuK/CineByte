import { Component } from '@angular/core';
import { TemaService } from '../../../cliente/features/movies/services/tema.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
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
