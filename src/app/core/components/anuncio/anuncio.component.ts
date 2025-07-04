import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Anuncio } from '../../../admin/models/anuncio.model';

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