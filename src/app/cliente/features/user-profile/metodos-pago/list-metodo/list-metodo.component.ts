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
    switch (tipoTarjeta) {
      case 'Visa':
        return 'fas fa-credit-card visa-card';
      case 'Mastercard':
        return 'fas fa-credit-card mastercard-card';
      case 'American Express':
        return 'fas fa-credit-card amex-card';
      case 'Discover':
        return 'fas fa-credit-card discover-card';
      case 'Diners Club':
        return 'fas fa-credit-card diners-card';
      case 'JCB':
        return 'fas fa-credit-card jcb-card';
      case 'Tarjeta de Crédito':
        return 'fas fa-credit-card credit-card';
      case 'Tarjeta Virtual':
        return 'fas fa-mobile-alt virtual-card';
      case 'Tarjeta Corporativa':
        return 'fas fa-building corporate-card';
      case 'Tarjeta de Débito':
        return 'fas fa-university debit-card';
      case 'Tarjeta Prepago':
        return 'fas fa-gift prepaid-card';
      case 'Tarjeta Bancaria':
        return 'fas fa-landmark bancaria-card';
      case 'Tarjeta de Servicios':
        return 'fas fa-tools servicios-card';
      case 'Tarjeta de Comercio':
        return 'fas fa-store comercio-card';
      case 'Tarjeta de Pago':
        return 'fas fa-money-bill-wave default-card';
      default:
        return 'fas fa-credit-card default-card';
    }
  }

  // Obtener color del tipo de tarjeta
  getCardColor(tipoTarjeta: string): string {
    switch (tipoTarjeta) {
      case 'Visa':
        return '#1434CB';
      case 'Mastercard':
        return '#FF5F00';
      case 'American Express':
        return '#006FCF';
      case 'Discover':
        return '#FF6000';
      case 'Diners Club':
        return '#0079BE';
      case 'JCB':
        return '#006EBA';
      case 'Tarjeta de Crédito':
        return '#28a745';
      case 'Tarjeta Virtual':
        return '#17a2b8';
      case 'Tarjeta Corporativa':
        return '#6c757d';
      case 'Tarjeta de Débito':
        return '#fd7e14';
      case 'Tarjeta Prepago':
        return '#e83e8c';
      case 'Tarjeta Bancaria':
        return '#007bff';
      case 'Tarjeta de Servicios':
        return '#6f42c1';
      case 'Tarjeta de Comercio':
        return '#20c997';
      case 'Tarjeta de Pago':
        return '#666';
      default:
        return '#666';
    }
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
