import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SeatInfo {
  row: string;
  number: number;
  price: number;
  image?: string | null;
}

interface AsientoLocal {
  id: string;
  fila: string;
  numero: number;
  estado: 'disponible' | 'ocupado' | 'seleccionado' | 'espacio';
  precio: number;
  id_asiento?: number;
  url_imagen?: string | null;
  tipo?: string;
}

interface SalaInfo {
  nombre: string;
  filas: string[][];
}

@Component({
  selector: 'app-simulation-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simulation-view.component.html',
  styleUrl: './simulation-view.component.css'
})
export class SimulationViewComponent implements OnInit {
  @Input() selectedSeats: SeatInfo[] = [];
  @Input() movieTitle: string = '';
  @Input() showtime: string = '';
  @Input() isOpen: boolean = false;
  @Input() salaName: string = 'Sala Principal'; // Nueva entrada para el nombre de la sala
  @Input() salaAsientos: AsientoLocal[] = []; // Asientos reales de la sala
  @Input() salaFilas: string[] = []; // Filas reales de la sala
  @Output() closeModal = new EventEmitter<void>();

  activeTab: number = 0;
  isImageExpanded: boolean = false;

  ngOnInit() {
    // Si hay asientos seleccionados, inicializar la primera pestaña
    if (this.selectedSeats.length > 0) {
      this.activeTab = 0;
    }
  }

  selectTab(index: number) {
    this.activeTab = index;
  }

  onClose() {
    this.isImageExpanded = false; // Reset al cerrar
    this.closeModal.emit();
  }

  // Métodos para manejo de imagen expandida
  toggleImageExpanded() {
    this.isImageExpanded = !this.isImageExpanded;
  }

  closeExpandedImage() {
    this.isImageExpanded = false;
  }

  getSeatLabel(seat: SeatInfo): string {
    return `${seat.row}${seat.number}`;
  }

  // Simular vista desde el asiento
  getSeatView(seatIndex: number): string {
    // Esta es una función simple que simula diferentes vistas
    // En una implementación real, tendrías imágenes específicas para cada ubicación
    const views = [
      'Vista frontal central - Excelente perspectiva de la pantalla',
      'Vista lateral izquierda - Buena visibilidad con ligero ángulo',
      'Vista lateral derecha - Buena visibilidad con ligero ángulo',
      'Vista frontal superior - Vista elevada de la pantalla',
      'Vista posterior - Vista completa de la sala'
    ];
    return views[seatIndex % views.length];
  }

  // Helper para obtener letras de filas
  getRowLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  // Helper para verificar si es el asiento actual
  isCurrentSeat(rowIndex: number, seatIndex: number): boolean {
    if (!this.selectedSeats[this.activeTab]) return false;
    const currentSeatLabel = this.getSeatLabel(this.selectedSeats[this.activeTab]);
    const checkSeatLabel = this.getRowLetter(rowIndex) + (seatIndex + 1);
    return currentSeatLabel === checkSeatLabel;
  }

  // Obtener imagen para el asiento
  getSeatImage(seatIndex: number): string {
    const seat = this.selectedSeats[seatIndex];
    // Buscar el asiento real en salaAsientos
    const asientoReal = this.salaAsientos.find(a => a.fila === seat.row && a.numero === seat.number);
    if (asientoReal && asientoReal.url_imagen && asientoReal.url_imagen.trim() !== '') {
      return asientoReal.url_imagen;
    }
    if (seat.image && seat.image.trim() !== '') {
      return seat.image;
    }
    return `https://picsum.photos/400/250?random=${seat.row}${seat.number}`;
  }

  // Métodos para el mapa de asientos
  getSeatMap(): string[][] {
    if (this.salaFilas.length === 0 || this.salaAsientos.length === 0) {
      // Fallback: generar un mapa simple
      const filas = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const map: string[][] = [];
      
      filas.forEach(fila => {
        const row: string[] = [];
        for (let i = 1; i <= 10; i++) {
          row.push(`${fila}${i}`);
        }
        map.push(row);
      });
      
      return map;
    }

    // Usar datos reales de la sala
    const map: string[][] = [];
    
    this.salaFilas.forEach(fila => {
      const asientosEnFila = this.salaAsientos
        .filter(asiento => asiento.fila === fila && asiento.estado !== 'espacio')
        .sort((a, b) => a.numero - b.numero)
        .map(asiento => asiento.id);
      
      if (asientosEnFila.length > 0) {
        map.push(asientosEnFila);
      }
    });
    
    return map;
  }

  getAsientosPorFila(fila: string): AsientoLocal[] {
    return this.salaAsientos
      .filter(asiento => asiento.fila === fila)
      .sort((a, b) => a.numero - b.numero);
  }

  isSeatCurrentlyViewed(seatId: string): boolean {
    if (!this.selectedSeats[this.activeTab]) return false;
    const currentSeat = this.selectedSeats[this.activeTab];
    const currentSeatId = `${currentSeat.row}${currentSeat.number}`;
    return currentSeatId === seatId;
  }
}
