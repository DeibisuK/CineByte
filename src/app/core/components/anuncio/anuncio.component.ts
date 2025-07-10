import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Anuncio } from '@core/models/anuncio.model'; // Adjust the import path as necessary

@Component({
  selector: 'app-anuncio',
  imports: [],
  templateUrl: './anuncio.component.html',
  styleUrl: './anuncio.component.css'
})
export class AnuncioComponent {
  @Input() anuncio!: Anuncio;
  @Output() cerrar = new EventEmitter<void>();
}