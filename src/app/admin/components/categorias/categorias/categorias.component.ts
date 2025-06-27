import { Component } from '@angular/core';
import { GenerosComponent } from '../generos/generos.component';
import { EtiquetasComponent } from '../etiquetas/etiquetas.component';
import { IdiomasComponent } from '../idiomas/idiomas.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categorias',
  imports: [GenerosComponent,
    EtiquetasComponent,IdiomasComponent,CommonModule
  ],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.css'
})
export class CategoriasComponent {
  pestanaActiva = 0;

  cambiarPestana(index: number) {
    this.pestanaActiva = index;
  }
}
