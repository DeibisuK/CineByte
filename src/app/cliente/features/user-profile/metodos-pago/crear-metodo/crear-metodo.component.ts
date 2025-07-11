import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { AlertaService, AuthService } from '@core/services';
import { MetodosPagoService } from '@features/payments';
import { MetodoPagoRequest } from '@core/models';

@Component({
  selector: 'app-crear-metodo',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './crear-metodo.component.html',
  styleUrl: './crear-metodo.component.css'
})
export class CrearMetodoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() isModalOpen: boolean = false;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() cardAdded = new EventEmitter<any>();

  cardForm: FormGroup;
  cardType: string = '';
  isLoading: boolean = false;
  currentUser: any = null;

  constructor(
    private auth: Auth,
    private fb: FormBuilder,
    private alertaService: AlertaService,
    private metodosPagoService: MetodosPagoService,
    private authService: AuthService
  ) {
    this.cardForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.minLength(13)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]]
    });
  }

  async ngOnInit() {
    await this.loadUserData();
    
    // Detectar tipo de tarjeta mientras se escribe
    this.cardForm.get('cardNumber')?.valueChanges.subscribe(value => {
      if (value) {
        this.cardType = this.metodosPagoService.detectarTipoTarjeta(value);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isModalOpen']) {
      if (this.isModalOpen) {
        // Prevenir scroll del body cuando el modal se abre
        document.body.style.overflow = 'hidden';
      } else {
        // Restaurar scroll del body cuando el modal se cierra
        document.body.style.overflow = 'auto';
      }
    }
  }

  private async loadUserData() {
    await new Promise<void>((resolve) => {
      const unsubscribe = this.auth.onAuthStateChanged(async (user) => {
        this.currentUser = user;
        unsubscribe();
        resolve();
      });
    });
  }

  closeModal() {
    this.isModalOpen = false;
    this.modalClosed.emit();
    this.cardForm.reset();
    this.cardType = '';
    // Restaurar scroll del body al cerrar modal
    document.body.style.overflow = 'auto';
  }

  async addCard() {
    if (!this.cardForm.valid) {
      this.alertaService.error('Error', 'Por favor, completa todos los campos correctamente.');
      return;
    }

    if (!this.currentUser) {
      this.alertaService.error('Error', 'Usuario no autenticado.');
      return;
    }

    const cardData = this.cardForm.value;
    
    // Validar número de tarjeta
    if (!this.metodosPagoService.validarNumeroTarjeta(cardData.cardNumber)) {
      this.alertaService.error('Error', 'Número de tarjeta no válido.');
      return;
    }

    // Validar CVV
    if (!this.metodosPagoService.validarCVV(cardData.cvv)) {
      this.alertaService.error('Error', 'CVV no válido.');
      return;
    }

    this.isLoading = true;

    try {
      // Convertir fecha MM/YY a formato YYYY-MM-DD para la API
      const [month, year] = cardData.expiryDate.split('/');
      const fullYear = `20${year}`;
      const fechaExpiracion = `${fullYear}-${month}-01`;

      const metodoPagoRequest: MetodoPagoRequest = {
        firebase_uid: this.currentUser.uid,
        numero_tarjeta: cardData.cardNumber.replace(/\s/g, ''), // Remover espacios
        fecha_expiracion: fechaExpiracion,
        cvv: cardData.cvv
      };

      const response = await this.metodosPagoService.addMetodoPago(metodoPagoRequest).toPromise();

      if (response?.message) {
        this.alertaService.success('¡Tarjeta agregada!', response.message);
        this.cardAdded.emit(response.metodo);
        this.closeModal();
      }
    } catch (error: any) {
      console.error('Error al agregar tarjeta:', error);
      const errorMessage = error.error?.error || 'No se pudo agregar la tarjeta. Intenta nuevamente.';
      this.alertaService.error('Error', errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = value.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      value = parts.join(' ');
    }
    
    event.target.value = value;
    this.cardForm.patchValue({ cardNumber: value });
  }

  formatExpiryDate(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    event.target.value = value;
    this.cardForm.patchValue({ expiryDate: value });
  }

  // Obtener icono del tipo de tarjeta
  getCardIcon(): string {
    switch (this.cardType) {
      case 'Visa':
        return 'fas fa-credit-card';
      case 'Mastercard':
        return 'fas fa-credit-card';
      case 'American Express':
        return 'fas fa-credit-card';
      case 'Discover':
        return 'fas fa-credit-card';
      case 'Diners Club':
        return 'fas fa-credit-card';
      case 'JCB':
        return 'fas fa-credit-card';
      case 'Tarjeta de Crédito':
        return 'fas fa-credit-card';
      case 'Tarjeta Virtual':
        return 'fas fa-mobile-alt';
      case 'Tarjeta Corporativa':
        return 'fas fa-building';
      case 'Tarjeta de Débito':
        return 'fas fa-university';
      case 'Tarjeta Prepago':
        return 'fas fa-gift';
      case 'Tarjeta Bancaria':
        return 'fas fa-landmark';
      case 'Tarjeta de Servicios':
        return 'fas fa-tools';
      case 'Tarjeta de Comercio':
        return 'fas fa-store';
      case 'Tarjeta de Pago':
        return 'fas fa-money-bill-wave';
      default:
        return 'fas fa-credit-card';
    }
  }

  // Obtener color del tipo de tarjeta
  getCardColor(): string {
    switch (this.cardType) {
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

  ngOnDestroy(): void {
    // Asegurar que el scroll se restaure si el componente se destruye
    document.body.style.overflow = 'auto';
  }
}
