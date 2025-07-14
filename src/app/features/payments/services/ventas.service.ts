import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { 
  CreateVentaRequest, 
  VentaResponse, 
  VentaHistorialResponse, 
  VentaEstadisticasResponse,
  Venta 
} from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  //private readonly apiURL = 'http://localhost:3000/api/ventas';
  private readonly apiURL = 'https://api-cinebyte-akvqp.ondigitalocean.app/api/ventas';

  constructor(private http: HttpClient) { }

  /**
   * Procesar una venta completa incluyendo asientos, pago y facturación
   * @param ventaData Datos de la venta a procesar
   * @returns Observable con la respuesta completa de la venta
   */
  procesarVenta(ventaData: CreateVentaRequest): Observable<VentaResponse> {
    return this.http.post<VentaResponse>(this.apiURL, ventaData);
  }

  /**
   * Obtener el historial de ventas de un usuario
   * @param firebase_uid UID del usuario de Firebase
   * @param limit Límite de resultados (opcional)
   * @param offset Offset para paginación (opcional)
   * @returns Observable con el historial de ventas
   */
  getHistorialVentas(
    firebase_uid: string, 
    limit?: number, 
    offset?: number
  ): Observable<VentaHistorialResponse[]> {
    let params = new HttpParams().set('firebase_uid', firebase_uid);
    
    if (limit !== undefined) {
      params = params.set('limit', limit.toString());
    }
    
    if (offset !== undefined) {
      params = params.set('offset', offset.toString());
    }

    return this.http.get<VentaHistorialResponse[]>(`${this.apiURL}/historial`, { params });
  }

  /**
   * Obtener una venta específica por ID
   * @param ventaId ID de la venta
   * @param firebase_uid UID del usuario (para validación)
   * @returns Observable con los datos de la venta
   */
  getVentaById(ventaId: number, firebase_uid: string): Observable<VentaResponse> {
    const params = new HttpParams().set('firebase_uid', firebase_uid);
    return this.http.get<VentaResponse>(`${this.apiURL}/${ventaId}`, { params });
  }

  /**
   * Cancelar una venta
   * @param ventaId ID de la venta a cancelar
   * @param firebase_uid UID del usuario
   * @returns Observable con el resultado de la cancelación
   */
  cancelarVenta(ventaId: number, firebase_uid: string): Observable<{ message: string }> {
    const body = { firebase_uid };
    return this.http.patch<{ message: string }>(`${this.apiURL}/${ventaId}/cancelar`, body);
  }

  /**
   * Obtener estadísticas de ventas de un usuario
   * @param firebase_uid UID del usuario
   * @param fecha_inicio Fecha de inicio para el rango (opcional)
   * @param fecha_fin Fecha de fin para el rango (opcional)
   * @returns Observable con las estadísticas
   */
  getEstadisticasVentas(
    firebase_uid: string,
    fecha_inicio?: string,
    fecha_fin?: string
  ): Observable<VentaEstadisticasResponse> {
    let params = new HttpParams().set('firebase_uid', firebase_uid);
    
    if (fecha_inicio) {
      params = params.set('fecha_inicio', fecha_inicio);
    }
    
    if (fecha_fin) {
      params = params.set('fecha_fin', fecha_fin);
    }

    return this.http.get<VentaEstadisticasResponse>(`${this.apiURL}/estadisticas`, { params });
  }

  /**
   * Verificar disponibilidad de asientos antes de procesar venta
   * @param funcion_id ID de la función
   * @param asientos Array de números de asientos
   * @returns Observable con el estado de disponibilidad
   */
  verificarDisponibilidadAsientos(
    funcion_id: number, 
    asientos: string[]
  ): Observable<{ disponibles: boolean; asientos_ocupados: string[] }> {
    const body = { funcion_id, asientos };
    return this.http.post<{ disponibles: boolean; asientos_ocupados: string[] }>(
      `${this.apiURL}/verificar-asientos`, 
      body
    );
  }

  /**
   * Obtener el resumen de una venta para mostrar antes de confirmar
   * @param ventaData Datos de la venta a procesar
   * @returns Observable con el resumen calculado
   */
  getResumenVenta(ventaData: Omit<CreateVentaRequest, 'metodo_pago_id' | 'transaccion_id'>): Observable<{
    subtotal: number;
    iva: number;
    total: number;
    total_asientos: number;
    detalle_asientos: {
      numero_asiento: string;
      precio_asiento: number;
    }[];
  }> {
    return this.http.post<{
      subtotal: number;
      iva: number;
      total: number;
      total_asientos: number;
      detalle_asientos: {
        numero_asiento: string;
        precio_asiento: number;
      }[];
    }>(`${this.apiURL}/resumen`, ventaData);
  }

  /**
   * Reenviar factura por email
   * @param ventaId ID de la venta
   * @param firebase_uid UID del usuario
   * @param email Email donde enviar la factura
   * @returns Observable con el resultado del envío
   */
  reenviarFactura(
    ventaId: number, 
    firebase_uid: string, 
    email: string
  ): Observable<{ message: string }> {
    const body = { firebase_uid, email };
    return this.http.post<{ message: string }>(`${this.apiURL}/${ventaId}/reenviar-factura`, body);
  }

  /**
   * Obtener QR de la venta para acceso al cine
   * @param ventaId ID de la venta
   * @param firebase_uid UID del usuario
   * @returns Observable con la URL del código QR
   */
  getQRVenta(ventaId: number, firebase_uid: string): Observable<{ qr_url: string; qr_data: string }> {
    const params = new HttpParams().set('firebase_uid', firebase_uid);
    return this.http.get<{ qr_url: string; qr_data: string }>(`${this.apiURL}/${ventaId}/qr`, { params });
  }

  /**
   * Validar cupón de descuento
   * @param codigo_cupon Código del cupón
   * @param firebase_uid UID del usuario
   * @param total_venta Total de la venta antes del descuento
   * @returns Observable con la información del cupón
   */
  validarCupon(
    codigo_cupon: string, 
    firebase_uid: string, 
    total_venta: number
  ): Observable<{
    valido: boolean;
    descuento_porcentaje?: number;
    descuento_monto?: number;
    total_con_descuento?: number;
    mensaje?: string;
  }> {
    const body = { codigo_cupon, firebase_uid, total_venta };
    return this.http.post<{
      valido: boolean;
      descuento_porcentaje?: number;
      descuento_monto?: number;
      total_con_descuento?: number;
      mensaje?: string;
    }>(`${this.apiURL}/validar-cupon`, body);
  }

  /**
   * ✅ NUEVO: Obtener asientos disponibles para una función específica
   * @param idSala ID de la sala
   * @param idFuncion ID de la función
   * @returns Observable con los asientos disponibles
   */
  getAsientosDisponiblesPorFuncion(
    idSala: number, 
    idFuncion: number
  ): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(
      `${this.apiURL}/asientos-disponibles/${idSala}/${idFuncion}`
    );
  }

  /**
   * ✅ NUEVO: Obtener estadísticas de ocupación de una función
   * @param idFuncion ID de la función
   * @returns Observable con las estadísticas de ocupación
   */
  getOcupacionPorFuncion(
    idFuncion: number
  ): Observable<{ 
    success: boolean; 
    data: {
      id_funcion: number;
      sala: string;
      id_sala: number;
      total_asientos: number;
      asientos_vendidos: number;
      asientos_disponibles: number;
      porcentaje_ocupacion: number;
    }
  }> {
    return this.http.get<any>(`${this.apiURL}/ocupacion/${idFuncion}`);
  }

  //ventas por mes
  getVentasPorMesYAnio( month: number, year: number): Observable<any> {
    return this.http.get<any>(`${this.apiURL}/ventas-por-mes/${month}/${year}`);
  }

  getAllBoletosVendidos(month: number, year: number): Observable<any> {
    return this.http.get<any>(`${this.apiURL}/boletos-vendidos/${month}/${year}`);
  }

  getVentasPorDia(startDate: string, endDate: string): Observable<any> {
    return this.http.get<any>(`${this.apiURL}/ventas-por-dia/${startDate}/${endDate}`);
  }

}
