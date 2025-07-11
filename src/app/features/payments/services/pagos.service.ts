import { Injectable } from '@angular/core';
import { Observable, forkJoin, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { MetodosPagoService } from './metodos-pago.service';
import { VentasService } from './ventas.service';
import { 
  CreateVentaRequest, 
  VentaResponse, 
  MetodoPago,
  CreateVentaAsientoRequest 
} from '@core/models';

export interface PagoCompleto {
  firebase_uid: string;
  funcion_id: number;
  asientos: CreateVentaAsientoRequest[];
  metodo_pago: MetodoPago;
  datos_tarjeta?: {
    cvv: string;
  };
}

export interface ResumenPago {
  subtotal: number;
  iva: number;
  total: number;
  total_asientos: number;
  metodo_pago: MetodoPago;
  asientos: {
    numero_asiento: string;
    precio_asiento: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class PagosService {

  constructor(
    private metodosPagoService: MetodosPagoService,
    private ventasService: VentasService
  ) { }

  /**
   * Obtener resumen completo del pago incluyendo método de pago
   * @param pagoData Datos del pago
   * @returns Observable con el resumen completo
   */
  getResumenPagoCompleto(pagoData: Omit<PagoCompleto, 'datos_tarjeta'>): Observable<ResumenPago> {
    return forkJoin({
      metodoPago: this.metodosPagoService.getMetodoPagoById(pagoData.metodo_pago.id_metodo_pago, pagoData.firebase_uid),
      resumenVenta: this.ventasService.getResumenVenta({
        firebase_uid: pagoData.firebase_uid,
        funcion_id: pagoData.funcion_id,
        asientos: pagoData.asientos
      })
    }).pipe(
      map(({ metodoPago, resumenVenta }) => ({
        subtotal: resumenVenta.subtotal,
        iva: resumenVenta.iva,
        total: resumenVenta.total,
        total_asientos: resumenVenta.total_asientos,
        metodo_pago: metodoPago,
        asientos: resumenVenta.detalle_asientos
      }))
    );
  }

  /**
   * Procesar pago completo con validaciones
   * @param pagoData Datos completos del pago
   * @returns Observable con la respuesta de la venta procesada
   */
  procesarPagoCompleto(pagoData: PagoCompleto): Observable<VentaResponse> {
    // Primero verificar que el método de pago existe y pertenece al usuario
    return this.metodosPagoService.getMetodoPagoById(pagoData.metodo_pago.id_metodo_pago, pagoData.firebase_uid).pipe(
      switchMap(metodoPago => {
        // Verificar disponibilidad de asientos
        const numerosAsientos = pagoData.asientos.map(a => a.numero_asiento);
        return this.ventasService.verificarDisponibilidadAsientos(pagoData.funcion_id, numerosAsientos).pipe(
          switchMap(disponibilidad => {
            if (!disponibilidad.disponibles) {
              return throwError(() => new Error(`Los siguientes asientos ya no están disponibles: ${disponibilidad.asientos_ocupados.join(', ')}`));
            }

            // Generar ID de transacción único
            const transaccionId = this.generarTransactionId();

            // Preparar datos para la venta
            const ventaRequest: CreateVentaRequest = {
              firebase_uid: pagoData.firebase_uid,
              funcion_id: pagoData.funcion_id,
              asientos: pagoData.asientos,
              metodo_pago_id: metodoPago.id_metodo_pago,
              transaccion_id: transaccionId
            };

            // Procesar la venta
            return this.ventasService.procesarVenta(ventaRequest);
          })
        );
      }),
      catchError(error => {
        console.error('Error al procesar pago:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Validar datos de tarjeta antes del pago
   * @param metodoPago Método de pago a validar
   * @param cvv CVV ingresado por el usuario
   * @returns Observable que indica si la validación fue exitosa
   */
  validarDatosTarjeta(metodoPago: MetodoPago, cvv: string): Observable<boolean> {
    return new Observable(observer => {
      try {
        // Validar CVV
        if (!this.metodosPagoService.validarCVV(cvv)) {
          observer.error(new Error('CVV inválido'));
          return;
        }

        // Validar que la tarjeta no esté vencida
        if (this.esTarjetaVencida(metodoPago.fecha_expiracion)) {
          observer.error(new Error('La tarjeta ha expirado'));
          return;
        }

        // Validar número de tarjeta
        if (!this.metodosPagoService.validarNumeroTarjeta(metodoPago.numero_tarjeta)) {
          observer.error(new Error('Número de tarjeta inválido'));
          return;
        }

        observer.next(true);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  /**
   * Obtener métodos de pago de un usuario con información de estado
   * @param firebase_uid UID del usuario
   * @returns Observable con los métodos de pago y su estado
   */
  getMetodosPagoConEstado(firebase_uid: string): Observable<(MetodoPago & { estado: 'activo' | 'vencido' | 'por_vencer' })[]> {
    return this.metodosPagoService.getMetodosPagoByUser(firebase_uid).pipe(
      map(metodos => metodos.map(metodo => ({
        ...metodo,
        estado: this.getEstadoTarjeta(metodo.fecha_expiracion)
      })))
    );
  }

  /**
   * Obtener historial de pagos con detalles de películas
   * @param firebase_uid UID del usuario
   * @param limit Límite de resultados
   * @param offset Offset para paginación
   * @returns Observable con el historial de pagos
   */
  getHistorialPagos(firebase_uid: string, limit?: number, offset?: number): Observable<any[]> {
    return this.ventasService.getHistorialVentas(firebase_uid, limit, offset);
  }

  /**
   * Reenviar ticket/factura por email
   * @param ventaId ID de la venta
   * @param firebase_uid UID del usuario
   * @param email Email de destino
   * @returns Observable con el resultado del envío
   */
  reenviarTicket(ventaId: number, firebase_uid: string, email: string): Observable<{ message: string }> {
    return this.ventasService.reenviarFactura(ventaId, firebase_uid, email);
  }

  /**
   * Obtener código QR para acceso al cine
   * @param ventaId ID de la venta
   * @param firebase_uid UID del usuario
   * @returns Observable con los datos del QR
   */
  getQRAcceso(ventaId: number, firebase_uid: string): Observable<{ qr_url: string; qr_data: string }> {
    return this.ventasService.getQRVenta(ventaId, firebase_uid);
  }

  // Métodos auxiliares privados

  /**
   * Generar ID único para transacción
   */
  private generarTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `TXN_${timestamp}_${random}`;
  }

  /**
   * Verificar si una tarjeta está vencida
   */
  private esTarjetaVencida(fechaExpiracion: string): boolean {
    const [mes, año] = fechaExpiracion.split('/');
    const fechaVencimiento = new Date(2000 + parseInt(año), parseInt(mes) - 1);
    const ahora = new Date();
    ahora.setDate(1); // Primer día del mes actual
    return fechaVencimiento < ahora;
  }

  /**
   * Obtener estado de la tarjeta basado en fecha de expiración
   */
  private getEstadoTarjeta(fechaExpiracion: string): 'activo' | 'vencido' | 'por_vencer' {
    const [mes, año] = fechaExpiracion.split('/');
    const fechaVencimiento = new Date(2000 + parseInt(año), parseInt(mes) - 1);
    const ahora = new Date();
    const tresMesesAdelante = new Date();
    tresMesesAdelante.setMonth(ahora.getMonth() + 3);

    if (fechaVencimiento < ahora) {
      return 'vencido';
    } else if (fechaVencimiento <= tresMesesAdelante) {
      return 'por_vencer';
    } else {
      return 'activo';
    }
  }
}
