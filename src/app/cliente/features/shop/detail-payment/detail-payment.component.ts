import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth, User } from '@angular/fire/auth';
import { CrearMetodoComponent } from '../../user-profile/metodos-pago/crear-metodo/crear-metodo.component';
import { MetodosPagoService } from '@features/payments';
import { PeliculaService } from '@features/movies/services/pelicula.service';
import { AuthService, AlertaService } from '@core/services';
import { MetodoPago, Pelicula } from '@core/models';

interface CompraInfo {
  pelicula: number;
  titulo: string;
  idioma: string;
  horario: string;
  cantidad: number;
  precio: number;
  total: number;
  portada?: string;
  sala?: string;
  asientosSeleccionados?: any[];
  id_sala?: number | null;
}

@Component({
  selector: 'app-detail-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CrearMetodoComponent],
  templateUrl: './detail-payment.component.html',
  styleUrl: './detail-payment.component.css'
})
export class DetailPaymentComponent implements OnInit {
  
  compraInfo: CompraInfo = {
    pelicula: 0,
    titulo: 'Título de Película',
    idioma: 'Español',
    horario: '19:00',
    cantidad: 2,
    precio: 15000,
    total: 30000,
    portada: 'https://picsum.photos/200/300',
    sala: 'Sala VIP'
  };

  // Formulario de cupón
  couponForm: FormGroup;
  
  // Usuario actual
  currentUser: User | null = null;
  userDisplayName: string = '';
  userEmail: string = '';
  
  // Película completa para obtener duración
  peliculaCompleta: Pelicula | null = null;
  
  // Métodos de pago
  metodosPago: MetodoPago[] = [];
  selectedPaymentMethod: MetodoPago | null = null;
  showAddPaymentModal = false;
  
  // Estados
  isLoading = false;
  loadingPayments = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private auth: Auth,
    private authService: AuthService,
    private metodosPagoService: MetodosPagoService,
    private peliculaService: PeliculaService,
    private alertaService: AlertaService
  ) {
    this.couponForm = this.fb.group({
      couponCode: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    // Intentar cargar datos desde sessionStorage primero
    this.loadDataFromStorage();
    
    // Cargar datos del usuario SIEMPRE (incluso al recargar)
    this.loadUserData();
    
    // Cargar métodos de pago SIEMPRE (incluso al recargar)
    this.loadPaymentMethods();
    
    // Obtener parámetros de la URL (pueden sobrescribir los datos del storage)
    this.route.queryParams.subscribe(params => {
      if (params['titulo']) {
        let asientosSeleccionados: any[] = [];
        
        // Manejar asientos seleccionados de forma segura
        if (params['asientosSeleccionados']) {
          if (typeof params['asientosSeleccionados'] === 'string') {
            // Si es un string, dividir por comas
            asientosSeleccionados = params['asientosSeleccionados'].split(',');
          } else if (Array.isArray(params['asientosSeleccionados'])) {
            asientosSeleccionados = params['asientosSeleccionados'];
          }
        }
        
        this.compraInfo = {
          pelicula: +params['pelicula'] || 1,
          titulo: params['titulo'] || 'Título de Película',
          idioma: params['idioma'] || 'Español',
          horario: params['horario'] || '19:00',
          cantidad: +params['cantidad'] || 2,
          precio: +params['precio'] || 15000,
          total: +params['total'] || 30000,
          portada: params['portada'] || 'https://picsum.photos/200/300',
          sala: params['sala'] || 'Sala Principal',
          asientosSeleccionados: asientosSeleccionados,
          id_sala: +params['id_sala'] || null
        };
        
        console.log('Datos recibidos en detail-payment:', this.compraInfo);
        
        // Guardar en sessionStorage
        this.saveDataToStorage();
        
        // Cargar portada real de la película
        this.loadMoviePoster();
      } else if (this.compraInfo.pelicula) {
        // Si no hay parámetros pero hay datos en storage, cargar portada
        this.loadMoviePoster();
      }
    });
    this.loadUserData();
    
    // Cargar métodos de pago
    this.loadPaymentMethods();
  }

  private loadDataFromStorage(): void {
    const savedData = sessionStorage.getItem('detail-payment-data');
    if (savedData) {
      try {
        this.compraInfo = JSON.parse(savedData);
      } catch (error) {
        console.error('Error loading data from storage:', error);
      }
    }
  }

  private saveDataToStorage(): void {
    try {
      sessionStorage.setItem('detail-payment-data', JSON.stringify(this.compraInfo));
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  }

  private loadMoviePoster(): void {
    if (this.compraInfo.pelicula) {
      this.peliculaService.getPeliculaById(this.compraInfo.pelicula).subscribe({
        next: (pelicula: Pelicula) => {
          if (pelicula) {
            this.peliculaCompleta = pelicula; // Guardar película completa
            if (pelicula.imagen) {
              this.compraInfo.portada = pelicula.imagen;
              this.saveDataToStorage(); // Actualizar storage con la nueva portada
            }
          }
        },
        error: (error) => {
          console.error('Error loading movie poster:', error);
        }
      });
    }
  }

  // Función para obtener horario con hora de fin
  obtenerHorarioConFin(): string {
    if (!this.peliculaCompleta?.duracion_minutos) {
      return `${this.compraInfo.idioma} | ${this.compraInfo.horario}`;
    }

    try {
      // Parsear la hora de inicio (formato HH:MM)
      const [horaStr, minutoStr] = this.compraInfo.horario.split(':');
      const horaInicio = parseInt(horaStr);
      const minutoInicio = parseInt(minutoStr);
      
      // Calcular hora de fin
      let minutosTotales = horaInicio * 60 + minutoInicio + this.peliculaCompleta.duracion_minutos;
      let horaFin = Math.floor(minutosTotales / 60);
      let minutoFin = minutosTotales % 60;
      
      // Manejar cambio de día (24h+)
      if (horaFin >= 24) {
        horaFin = horaFin - 24;
      }
      
      // Formatear con ceros a la izquierda
      const horaFinStr = horaFin.toString().padStart(2, '0');
      const minutoFinStr = minutoFin.toString().padStart(2, '0');
      
      return `${this.compraInfo.idioma} | ${this.compraInfo.horario} - ${horaFinStr}:${minutoFinStr}`;
    } catch (error) {
      console.error('Error calculando hora de fin:', error);
      return `${this.compraInfo.idioma} | ${this.compraInfo.horario}`;
    }
  }

  // Cálculos de precio
  get subtotal(): number {
    return this.compraInfo.cantidad * this.compraInfo.precio;
  }

  get iva(): number {
    return this.subtotal * 0.12;
  }

  get totalConIva(): number {
    return this.subtotal + this.iva;
  }

  private async loadUserData(): Promise<void> {
    await new Promise<void>((resolve) => {
      const unsubscribe = this.auth.onAuthStateChanged(async (user) => {
        this.currentUser = user;
        if (user) {
          this.userDisplayName = user.displayName || 'Usuario';
          this.userEmail = user.email || '';
          console.log('User data loaded:', { name: this.userDisplayName, email: this.userEmail });
        } else {
          console.log('No current user found');
        }
        unsubscribe();
        resolve();
      });
    });
  }

  async loadPaymentMethods(): Promise<void> {
    // Esperar a que el usuario esté cargado
    if (!this.currentUser) {
      await this.loadUserData();
    }

    if (!this.currentUser) {
      console.warn('No user found for loading payment methods');
      return;
    }

    this.loadingPayments = true;
    try {
      // Usar la forma async/await con el observable
      this.metodosPago = await new Promise((resolve, reject) => {
        this.metodosPagoService.getMetodosPagoByUser(this.currentUser!.uid).subscribe({
          next: (metodos) => resolve(metodos),
          error: (error) => reject(error)
        });
      });
      console.log('Payment methods loaded:', this.metodosPago.length);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      this.metodosPago = [];
    } finally {
      this.loadingPayments = false;
    }
  }

  selectPaymentMethod(metodo: MetodoPago): void {
    this.selectedPaymentMethod = metodo;
  }

  openAddPaymentModal(): void {
    this.showAddPaymentModal = true;
  }

  closeAddPaymentModal(): void {
    this.showAddPaymentModal = false;
  }

  onPaymentMethodAdded(newMethod: any): void {
    this.loadPaymentMethods();
    this.closeAddPaymentModal();
    this.alertaService.success('Éxito', 'Método de pago agregado exitosamente');
  }

  validateCoupon(): void {
    if (this.couponForm.valid) {
      const couponCode = this.couponForm.get('couponCode')?.value;
      // TODO: Implementar lógica de validación de cupón
      console.log('Validating coupon:', couponCode);
      this.alertaService.info('Información', 'Funcionalidad de cupón en desarrollo');
    }
  }

  volverAtras(): void {
    // Navegar de vuelta a select-seat con los datos de compra incluyendo id_sala
    const selectSeatData = {
      pelicula: this.compraInfo.pelicula,
      titulo: this.compraInfo.titulo,
      idioma: this.compraInfo.idioma,
      horario: this.compraInfo.horario,
      cantidad: this.compraInfo.cantidad,
      precio: this.compraInfo.precio,
      total: this.compraInfo.total,
      id_sala: this.compraInfo.id_sala
    };
    
    console.log('Volviendo a select-seat con datos:', selectSeatData);
    
    this.router.navigate(['/select-seat'], { 
      queryParams: selectSeatData 
    });
  }

  procesarPago(): void {
    if (!this.selectedPaymentMethod) {
      this.alertaService.error('Error', 'Por favor selecciona un método de pago');
      return;
    }

    this.isLoading = true;
    
    // TODO: Implementar lógica de procesamiento de pago
    setTimeout(() => {
      this.isLoading = false;
      this.alertaService.success('Éxito', 'Pago procesado exitosamente');
      // Navegar al componente de confirmación
      this.router.navigate(['/cliente/payment-confirmation']);
    }, 2000);
  }

  getCardIcon(tipo: string): string {
    const iconMap: { [key: string]: string } = {
      'Visa': 'fab fa-cc-visa',
      'Mastercard': 'fab fa-cc-mastercard', 
      'American Express': 'fab fa-cc-amex',
      'Discover': 'fab fa-cc-discover',
      'Diners Club': 'fab fa-cc-diners-club',
      'JCB': 'fab fa-cc-jcb',
      'PayPal': 'fab fa-cc-paypal',
      'Apple Pay': 'fab fa-cc-apple-pay',
      'Stripe': 'fab fa-cc-stripe'
    };
    return iconMap[tipo] || 'fas fa-credit-card';
  }

  getCardColor(tipo: string): string {
    const colorMap: { [key: string]: string } = {
      'Visa': '#1a1f71',
      'Mastercard': '#eb001b',
      'American Express': '#006fcf',
      'Discover': '#ff6000',
      'Diners Club': '#0079be',
      'JCB': '#005998',
      'PayPal': '#003087',
      'Apple Pay': '#000000',
      'Stripe': '#635bff'
    };
    return colorMap[tipo] || 'var(--yellow)';
  }
}
