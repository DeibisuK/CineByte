import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { CrearMetodoComponent } from '../crear-metodo/crear-metodo.component';
import { MetodosPagoService } from '@features/payments';
import { AlertaService, AuthService } from '@core/services';
import { MetodoPago } from '@core/models';

@Component({
  selector: 'app-list-metodo',
  imports: [RouterModule, CrearMetodoComponent, CommonModule],
  templateUrl: './list-metodo.component.html',
  styleUrl: './list-metodo.component.css'
})
export class ListMetodoComponent implements OnInit {
  totalCards: number = 0;
  isModalOpen: boolean = false;
  cards: MetodoPago[] = [];
  isLoading: boolean = false;
  currentUser: any = null;

  constructor(
    private auth: Auth,
    public metodosPagoService: MetodosPagoService,
    private alertaService: AlertaService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    await this.loadUserData();
  }

  private async loadUserData() {
    await new Promise<void>((resolve) => {
      const unsubscribe = this.auth.onAuthStateChanged(async (user) => {
        this.currentUser = user;
        if (user) {
          await this.loadCards();
        }
        unsubscribe();
        resolve();
      });
    });
  }

  async loadCards() {
    if (!this.currentUser) return;

    this.isLoading = true;
    try {
      this.cards = await this.metodosPagoService.getMetodosPagoByUser(this.currentUser.uid).toPromise() || [];
      this.totalCards = this.cards.length;
    } catch (error: any) {
      console.error('Error al cargar tarjetas:', error);
      this.alertaService.error('Error', 'No se pudieron cargar los métodos de pago.');
    } finally {
      this.isLoading = false;
    }
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onCardAdded(cardData: any) {
    console.log('Nueva tarjeta agregada:', cardData);
    // Recargar la lista de tarjetas después de agregar una nueva
    this.loadCards();
    this.closeModal();
  }

  async deleteCard(card: MetodoPago) {
    if (!this.currentUser) return;

    const confirmation = await this.alertaService.confirmacion(
      '¿Estás seguro?',
      `¿Quieres eliminar la tarjeta terminada en ${card.numero_tarjeta.slice(-4)}?`,
      'Sí, eliminar',
      'Cancelar'
    );

    if (confirmation.isConfirmed) {
      try {
        await this.metodosPagoService.deleteMetodoPago(card.id_metodo_pago, this.currentUser.uid).toPromise();
        this.alertaService.success('Eliminado', 'La tarjeta ha sido eliminada correctamente.');
        this.loadCards(); // Recargar la lista
      } catch (error: any) {
        console.error('Error al eliminar tarjeta:', error);
        const errorMessage = error.error?.error || 'No se pudo eliminar la tarjeta.';
        this.alertaService.error('Error', errorMessage);
      }
    }
  }

  // Obtener icono del tipo de tarjeta
  getCardIcon(tipoTarjeta: string): string {
    const iconMap: { [key: string]: string } = {
      'Visa': 'fab fa-cc-visa',
      'Mastercard': 'fab fa-cc-mastercard', 
      'American Express': 'fab fa-cc-amex',
      'Discover': 'fab fa-cc-discover',
      'Diners Club': 'fab fa-cc-diners-club',
      'JCB': 'fab fa-cc-jcb',
      'PayPal': 'fab fa-cc-paypal',
      'Apple Pay': 'fab fa-cc-apple-pay',
      'Stripe': 'fab fa-cc-stripe',
      'Tarjeta de Crédito': 'fas fa-credit-card',
      'Tarjeta Virtual': 'fas fa-mobile-alt',
      'Tarjeta Corporativa': 'fas fa-building',
      'Tarjeta de Débito': 'fas fa-university',
      'Tarjeta Prepago': 'fas fa-gift',
      'Tarjeta Bancaria': 'fas fa-landmark',
      'Tarjeta de Servicios': 'fas fa-tools',
      'Tarjeta de Comercio': 'fas fa-store',
      'Tarjeta de Pago': 'fas fa-money-bill-wave'
    };
    return iconMap[tipoTarjeta] || 'fas fa-credit-card';
  }

  // Obtener color del tipo de tarjeta
  getCardColor(tipoTarjeta: string): string {
    const colorMap: { [key: string]: string } = {
      'Visa': '#1a1f71',
      'Mastercard': '#eb001b',
      'American Express': '#006fcf',
      'Discover': '#ff6000',
      'Diners Club': '#0079be',
      'JCB': '#005998',
      'PayPal': '#003087',
      'Apple Pay': '#000000',
      'Stripe': '#635bff',
      'Tarjeta de Crédito': '#28a745',
      'Tarjeta Virtual': '#17a2b8',
      'Tarjeta Corporativa': '#6c757d',
      'Tarjeta de Débito': '#fd7e14',
      'Tarjeta Prepago': '#e83e8c',
      'Tarjeta Bancaria': '#007bff',
      'Tarjeta de Servicios': '#6f42c1',
      'Tarjeta de Comercio': '#20c997',
      'Tarjeta de Pago': '#666'
    };
    return colorMap[tipoTarjeta] || '#666';
  }

  // Formatear fecha de expiración
  formatExpiryDate(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${year}`;
  }
}
