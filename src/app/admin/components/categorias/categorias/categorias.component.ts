import { Component } from '@angular/core';
import { GenerosComponent } from '../generos/generos.component';
import { EtiquetasComponent } from '../etiquetas/etiquetas.component';
import { IdiomasComponent } from '../idiomas/idiomas.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categorias',
  imports: [GenerosComponent,
    EtiquetasComponent, IdiomasComponent, CommonModule
  ],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.css'
})
export class CategoriasComponent {
  pestanaActiva = 0;

  cambiarPestana(tabIndex: number) {
    document.querySelectorAll('.tab-button').forEach((btn, index) => {
      btn.classList.toggle('active', index === tabIndex);
    });
    // Update tab indicator
    const tabsContainer = document.getElementById('tabsContainer');
    if (tabsContainer) {
      tabsContainer.className = `tabs tab-${tabIndex}`;

    }
    this.pestanaActiva = tabIndex;
  }


}
