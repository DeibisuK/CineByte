import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CrearMetodoComponent } from '../crear-metodo/crear-metodo.component';

@Component({
  selector: 'app-list-metodo',
  imports: [RouterModule, CrearMetodoComponent],
  templateUrl: './list-metodo.component.html',
  styleUrl: './list-metodo.component.css'
})
export class ListMetodoComponent {
  totalCards: number = 0;
  isModalOpen: boolean = false;
  cards: any[] = [];

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onCardAdded(cardData: any) {
    // Aquí puedes agregar la lógica para guardar la tarjeta
    console.log('Nueva tarjeta agregada:', cardData);
    this.cards.push(cardData);
    this.totalCards = this.cards.length;
    this.closeModal();
  }
}
