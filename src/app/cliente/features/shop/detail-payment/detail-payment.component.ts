import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth, User } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { CrearMetodoComponent } from '../../user-profile/metodos-pago/crear-metodo/crear-metodo.component';
import { MetodosPagoService } from '@features/payments';
import { PeliculaService } from '@features/movies/services/pelicula.service';
import { AuthService, AlertaService } from '@core/services';
import { MetodoPago, Pelicula } from '@core/models';
import { VentasService } from '@features/payments/services/ventas.service';
import { PagosService } from '@features/payments/services/pagos.service';
import Swal from 'sweetalert2';

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
  funcion_id?: number | null; // Agregar ID de función real
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
  
  // Variables para PDF
  ventaId: number | null = null;
  private apiUrl = 'https://api-cinebyte-akvqp.ondigitalocean.app'; // Ajusta según tu configuración
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private auth: Auth,
    private authService: AuthService,
    private metodosPagoService: MetodosPagoService,
    private peliculaService: PeliculaService,
    private alertaService: AlertaService,
    private ventasService: VentasService,
    private pagosService: PagosService,
    private http: HttpClient
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
          id_sala: +params['id_sala'] || null,
          funcion_id: +params['funcion_id'] || null // Capturar ID de función real
        };
        
        // NO mostrar confirmación inicial, ir directo a la página
        // this.mostrarConfirmacionInicial();
        
        // Guardar en sessionStorage
        this.saveDataToStorage();
        
        // Cargar portada real de la película
        this.loadMoviePoster();
      } else if (this.compraInfo.pelicula) {
        // Si no hay parámetros pero hay datos en storage, cargar portada
        this.loadMoviePoster();
      }
    });
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

      this.alertaService.info('Información', 'Funcionalidad de cupón en desarrollo');
    }
  }

  volverAtras(): void {
    // Navegar de vuelta a select-seat con los datos de compra incluyendo id_sala y funcion_id
    const selectSeatData = {
      pelicula: this.compraInfo.pelicula,
      titulo: this.compraInfo.titulo,
      idioma: this.compraInfo.idioma,
      horario: this.compraInfo.horario,
      cantidad: this.compraInfo.cantidad,
      precio: this.compraInfo.precio,
      total: this.compraInfo.total,
      id_sala: this.compraInfo.id_sala,
      funcion_id: this.compraInfo.funcion_id
    };
    

    
    this.router.navigate(['/select-seat'], { 
      queryParams: selectSeatData 
    });
  }

  async procesarPago(): Promise<void> {
    if (!this.selectedPaymentMethod) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor selecciona un método de pago',
        showConfirmButton: true
      });
      return;
    }

    // Validar que haya datos de compra
    if (!this.compraInfo.asientosSeleccionados || this.compraInfo.asientosSeleccionados.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No hay asientos seleccionados para procesar',
        showConfirmButton: true
      });
      return;
    }

    // Validar que el usuario esté autenticado (temporal: permitir usuario de prueba)
    if (!this.currentUser?.uid && !true) { // Cambié la condición para permitir continuar sin usuario
      Swal.fire({
        icon: 'error',
        title: 'Error de autenticación',
        text: 'Debes iniciar sesión para realizar la compra',
        showConfirmButton: true
      });
      return;
    }

    this.isLoading = true;

    // Declarar variable de asientos fuera del try-catch para acceso en ambos bloques
    let asientosParaVenta: any[] = [];

    try {
      // Mostrar confirmación antes de procesar
      const confirmacion = await Swal.fire({
        icon: 'question',
        title: '¿Confirmar compra?',
        html: `
          <div style="text-align: left;">
            <p><strong>Película:</strong> ${this.compraInfo.titulo}</p>
            <p><strong>Función:</strong> ${this.compraInfo.horario}</p>
            <p><strong>Sala:</strong> ${this.compraInfo.sala}</p>
            <p><strong>Asientos:</strong> ${this.compraInfo.asientosSeleccionados.join(', ')}</p>
            <p><strong>Total:</strong> $${this.totalConIva.toLocaleString()}</p>
            <p><strong>Método de pago:</strong> ${this.selectedPaymentMethod.tipo_tarjeta} ****${this.selectedPaymentMethod.numero_tarjeta.slice(-4)}</p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Sí, procesar compra',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
      });

      if (!confirmacion.isConfirmed) {
        this.isLoading = false;
        return;
      }

      // Preparar datos de asientos para la venta (ahora asíncrono)
      const asientosParaVentaPromises = this.compraInfo.asientosSeleccionados.map(async (asiento, index) => {
        const idAsientoReal = await this.obtenerIdAsiento(asiento);
        return {
          numero_asiento: asiento.replace(/\s+/g, ''), // Remover espacios del número de asiento
          precio_asiento: this.compraInfo.precio,
          id_asiento: idAsientoReal // ID real obtenido de la BD
        };
      });

      // Esperar a que todas las consultas de asientos se resuelvan
      asientosParaVenta = await Promise.all(asientosParaVentaPromises);

      // Crear datos de la venta según el modelo requerido
      const ventaData = {
        firebase_uid: this.currentUser?.uid || 'KJUWesPreyXJHJArs7PyAkisDVg2', // Usuario de prueba válido
        funcion_id: this.compraInfo.funcion_id || 8, // Usar ID de función real o fallback
        asientos: asientosParaVenta,
        metodo_pago_id: this.selectedPaymentMethod.id_metodo_pago,
        transaccion_id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // Procesar la venta
      const resultado = await this.ventasService.procesarVenta(ventaData).toPromise();

      if (resultado) {
        // Guardar ID de venta para PDF
        this.ventaId = resultado.venta.id || null;
        // Navegar directamente a end-payment con los datos de la compra
        this.router.navigate(['/final'], {
          queryParams: {
            ventaId: resultado.venta.id,
            total: resultado.venta.total,
            estado: resultado.pago.estado,
            titulo: this.compraInfo.titulo,
            cantidad: this.compraInfo.cantidad,
            horario: this.compraInfo.horario,
            sala: this.compraInfo.sala,
            asientos: JSON.stringify(this.compraInfo.asientosSeleccionados || [])
          }
        });
        // Se eliminó la SweetAlert de 'Compra procesada!' para evitar redundancia
      }

    } catch (error: any) {
      console.error('Error al procesar el pago:', error);
      
      let errorMessage = 'Ocurrió un error al procesar el pago. Por favor, intenta nuevamente.';
      
      // Manejo más específico de errores
      if (error?.error?.message) {
        const serverMessage = error.error.message;
        if (serverMessage.includes('asiento') && serverMessage.includes('ocupado')) {
          errorMessage = 'Algunos asientos ya no están disponibles. Por favor, selecciona otros asientos.';
        } else if (serverMessage.includes('foreign key constraint')) {
          errorMessage = 'Error de datos: Verifica que la función y asientos sean válidos.';
        } else if (serverMessage.includes('does not exist')) {
          errorMessage = 'Error de configuración: Algunos datos no existen en el sistema.';
        } else {
          errorMessage = `Error del servidor: ${serverMessage}`;
        }
      } else if (error?.message) {
        if (error.message.includes('asientos no disponibles')) {
          errorMessage = 'Algunos asientos ya no están disponibles. Por favor, selecciona otros asientos.';
        } else if (error.message.includes('función no encontrada')) {
          errorMessage = 'La función seleccionada ya no está disponible.';
        } else if (error.message.includes('no encontrado') || error.message.includes('Asiento') || error.message.includes('Sala')) {
          errorMessage = 'Error al verificar asientos: ' + error.message + '. Por favor, selecciona otros asientos.';
        } else if (error.message.includes('pago')) {
          errorMessage = 'Error en el procesamiento del pago. Verifica tu método de pago.';
        }
      } else if (error?.status) {
        switch (error.status) {
          case 400:
            errorMessage = 'Datos de compra inválidos. Verifica la información enviada.';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado. La función o asientos pueden no existir.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Intenta nuevamente en unos momentos.';
            break;
          default:
            errorMessage = `Error HTTP ${error.status}: ${error.statusText || 'Error desconocido'}`;
        }
      }

      await Swal.fire({
        icon: 'error',
        title: 'Error en el pago',
        text: errorMessage,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#d33'
      });
    } finally {
      this.isLoading = false;
    }
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

  // Métodos auxiliares para mostrar información de tarjetas
  getCardDisplayType(metodo: MetodoPago): string {
    return metodo.tipo_tarjeta || 'Tarjeta';
  }

  getCardLastDigits(metodo: MetodoPago): string {
    return metodo.numero_tarjeta.slice(-4);
  }

  private async mostrarConfirmacionInicial(): Promise<void> {
    // Mostrar confirmación de la selección realizada
    await Swal.fire({
      icon: 'success',
      title: '¡Selección confirmada!',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <p><strong>Película:</strong> ${this.compraInfo.titulo}</p>
          <p><strong>Sala:</strong> ${this.compraInfo.sala}</p>
          <p><strong>Horario:</strong> ${this.compraInfo.horario}</p>
          <p><strong>Asientos:</strong> ${this.compraInfo.asientosSeleccionados?.join(', ')}</p>
          <p><strong>Total:</strong> $${this.totalConIva.toLocaleString()}</p>
          <hr>
          <p><small>Ahora selecciona tu método de pago para completar la compra.</small></p>
        </div>
      `,
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#28a745',
      allowOutsideClick: false
    });
  }

  /**
   * Obtiene el ID del asiento basado en su número/código consultando la API
   * Esta función consulta la base de datos para obtener el ID real del asiento
   */
  private async obtenerIdAsiento(numeroAsiento: string): Promise<number> {
    // Limpiar el número de asiento (remover espacios)
    const asientoLimpio = numeroAsiento.replace(/\s+/g, '');
    
    if (!this.compraInfo.id_sala) {
      throw new Error('ID de sala no disponible para consultar asientos');
    }

    try {
      // Hacer consulta HTTP a la API para obtener asientos de la sala
      const url = `${this.apiUrl}/api/salas/asientos/${this.compraInfo.id_sala}`;
      
      const asientosResponse = await this.http.get<any[]>(url).toPromise();
      
      if (!asientosResponse || asientosResponse.length === 0) {
        throw new Error(`No se encontraron asientos para la sala ${this.compraInfo.id_sala}`);
      }

      // Buscar el asiento específico por su código/número
      const asientoEncontrado = asientosResponse.find(asiento => {
        // Extraer fila y columna del asiento buscado (ej: "A4" -> fila="A", columna=4)
        const filaLetra = asientoLimpio.charAt(0).toUpperCase();
        const numeroColumna = parseInt(asientoLimpio.substring(1));
        
        // Limpiar la fila de la BD (remover espacios al final)
        const filaDB = asiento.fila?.trim().toUpperCase();
        const columnaDB = asiento.columna;
        
        // Comparar fila y columna
        const coincide = filaDB === filaLetra && columnaDB === numeroColumna;
        
        return coincide;
      });

      if (!asientoEncontrado) {
        throw new Error(`Asiento ${asientoLimpio} no encontrado en la sala ${this.compraInfo.id_sala}`);
      }

      const idAsientoReal = asientoEncontrado.id_asiento;
      
      return idAsientoReal;

    } catch (error: any) {      
      if (error.status === 404) {
        throw new Error(`Sala ${this.compraInfo.id_sala} no encontrada`);
      } else if (error.status === 500) {
        throw new Error('Error del servidor al consultar asientos');
      } else if (error.message) {
        throw error; // Re-lanzar errores específicos
      } else {
        throw new Error('Error desconocido al consultar asientos');
      }
    }
  }

  /**
   * Genera y descarga la factura en PDF
   */
  async generarFacturaPDF(): Promise<void> {
    if (!this.ventaId || !this.currentUser?.uid) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se puede generar la factura. Datos de venta faltantes.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    try {
      // Mostrar loader
      Swal.fire({
        title: 'Generando factura...',
        text: 'Por favor espera mientras preparamos tu factura PDF',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Llamar al endpoint de factura PDF
      const response = await this.http.get(
        `${this.apiUrl}/api/export/factura/${this.ventaId}/${this.currentUser.uid}`,
        { 
          responseType: 'blob',
          observe: 'response'
        }
      ).toPromise();

      if (response && response.body) {
        // Obtener el nombre del archivo de la respuesta
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `Factura_${this.ventaId}_${new Date().toISOString().split('T')[0]}.pdf`;
        
        if (contentDisposition) {
          const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }

        // Crear blob y descargar
        const blob = new Blob([response.body], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        // Crear enlace de descarga
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        
        // Limpiar
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);

        // Cerrar loader y mostrar éxito
        Swal.fire({
          icon: 'success',
          title: '¡Factura generada!',
          text: 'Tu factura PDF ha sido descargada exitosamente.',
          confirmButtonText: 'Perfecto'
        });

      } else {
        throw new Error('Respuesta vacía del servidor');
      }

    } catch (error: any) {
      let errorMessage = 'Error al generar la factura PDF. Intenta nuevamente.';
      
      if (error?.status === 404) {
        errorMessage = 'No se encontró la venta solicitada.';
      } else if (error?.status === 500) {
        errorMessage = 'Error interno del servidor. Intenta más tarde.';
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      }

      Swal.fire({
        icon: 'error',
        title: 'Error al generar factura',
        text: errorMessage,
        confirmButtonText: 'Entendido'
      });
    }
  }
}
