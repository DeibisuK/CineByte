import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Sala } from '../../../models/salas.model';

@Component({
  selector: 'app-list-salas',
  imports: [CommonModule, RouterModule],
  templateUrl: './list-salas.component.html',
  styleUrl: './list-salas.component.css'
})
export class ListSalasComponent {
  salas: Sala[] = [];
  salasFiltradas: Sala[] = []
  ngOnInit() {
    this.cargarSalas();
    //this.actualizarEstadisticas();
    //this.configurarFiltros();
  }

  cargarSalas() {

  }
}
