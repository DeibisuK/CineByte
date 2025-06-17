import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-anuncio',
  imports: [],
  templateUrl: './anuncio.component.html',
  styleUrl: './anuncio.component.css'
})
export class AnuncioComponent {
  @Input() mensaje: string = '¡Promoción especial!';
  @Input() modoOscuro: boolean = false;
  @Input() mostrar: boolean = true;
  @Output() cerrar = new EventEmitter<void>();
}
