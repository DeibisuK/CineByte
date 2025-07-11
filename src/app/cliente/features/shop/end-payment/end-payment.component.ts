import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-end-payment',
  imports: [CommonModule],
  templateUrl: './end-payment.component.html',
  styleUrl: './end-payment.component.css'
})
export class EndPaymentComponent implements OnInit {
  
  compraInfo = {
    titulo: 'Spider-Man: No Way Home',
    numeroFactura: 'CINE-2025-001247',
    asientos: ['F5', 'F6'],
    horario: '10:30 AM',
    fecha: '11 de Julio, 2025',
    sala: '3',
    precio: '$45.50'
  };

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  finalizarCompra(): void {
    this.router.navigate(['/inicio']);
  }

  imprimirDetalle(): void {
    // Funcionalidad de impresión se implementará después
    console.log('Imprimir detalle PDF');
  }

}
