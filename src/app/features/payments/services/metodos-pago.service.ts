import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MetodoPago, MetodoPagoRequest, MetodoPagoResponse } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class MetodosPagoService {
  //apiURL = 'http://localhost:3000/api/metodos-pago';
  apiURL = 'https://api-cinebyte-akvqp.ondigitalocean.app/api/metodos-pago';

  constructor(private http: HttpClient) { }

  // Obtener todos los métodos de pago de un usuario
  getMetodosPagoByUser(firebase_uid: string): Observable<MetodoPago[]> {
    return this.http.get<MetodoPago[]>(`${this.apiURL}/user/${firebase_uid}`);
  }

  // Obtener un método de pago por ID
  getMetodoPagoById(id: number, firebase_uid: string): Observable<MetodoPago> {
    return this.http.get<MetodoPago>(`${this.apiURL}/${id}?firebase_uid=${firebase_uid}`);
  }

  // Crear un nuevo método de pago
  addMetodoPago(metodo: MetodoPagoRequest): Observable<MetodoPagoResponse> {
    return this.http.post<MetodoPagoResponse>(this.apiURL, metodo);
  }

  // Actualizar un método de pago
  updateMetodoPago(id: number, metodo: MetodoPagoRequest): Observable<MetodoPagoResponse> {
    return this.http.put<MetodoPagoResponse>(`${this.apiURL}/${id}`, metodo);
  }

  // Eliminar un método de pago
  deleteMetodoPago(id: number, firebase_uid: string): Observable<any> {
    return this.http.delete(`${this.apiURL}/${id}?firebase_uid=${firebase_uid}`);
  }

  // Función auxiliar para detectar el tipo de tarjeta en el frontend
  detectarTipoTarjeta(numeroTarjeta: string): string {
    const numero = numeroTarjeta.replace(/\s/g, ''); // Remover espacios
    const primerosCuatro = numero.substring(0, 4);
    const primerosSeis = numero.substring(0, 6);
    
    if (numero.startsWith('4')) {
      return 'Visa';
    } else if (numero.startsWith('5') || (numero.startsWith('2') && parseInt(primerosCuatro) >= 2221 && parseInt(primerosCuatro) <= 2720)) {
      return 'Mastercard';
    } else if (numero.startsWith('34') || numero.startsWith('37')) {
      return 'American Express';
    } else if (numero.startsWith('6011') || numero.startsWith('644') || numero.startsWith('645') || numero.startsWith('646') || numero.startsWith('647') || numero.startsWith('648') || numero.startsWith('649') || numero.startsWith('65')) {
      return 'Discover';
    } else if (numero.startsWith('30') || numero.startsWith('36') || numero.startsWith('38')) {
      return 'Diners Club';
    } else if (numero.startsWith('35')) {
      return 'JCB';
    } else if (numero.startsWith('1')) {
      return 'Tarjeta de Crédito';
    } else if (numero.startsWith('9')) {
      return 'Tarjeta Virtual';
    } else if (numero.startsWith('8')) {
      return 'Tarjeta Corporativa';
    } else if (numero.startsWith('7')) {
      return 'Tarjeta de Débito';
    } else if (numero.startsWith('0')) {
      return 'Tarjeta Prepago';
    } else {
      // Retornar un nombre descriptivo basado en el primer dígito
      const primerDigito = numero.charAt(0);
      switch (primerDigito) {
        case '2':
          return 'Tarjeta Bancaria';
        case '3':
          return 'Tarjeta de Servicios';
        case '6':
          return 'Tarjeta de Comercio';
        default:
          return 'Tarjeta de Pago';
      }
    }
  }

  // Función auxiliar para validar número de tarjeta
  validarNumeroTarjeta(numeroTarjeta: string): boolean {
    const numero = numeroTarjeta.replace(/\s/g, '');
    return /^\d{13,19}$/.test(numero);
  }

  // Función auxiliar para validar CVV
  validarCVV(cvv: string): boolean {
    return /^\d{3,4}$/.test(cvv);
  }

  // Función auxiliar para formatear número de tarjeta (agregar espacios)
  formatearNumeroTarjeta(numeroTarjeta: string): string {
    const numero = numeroTarjeta.replace(/\s/g, '');
    return numero.replace(/(\d{4})/g, '$1 ').trim();
  }

  // Función auxiliar para enmascarar número de tarjeta
  enmascararNumeroTarjeta(numeroTarjeta: string): string {
    const numero = numeroTarjeta.replace(/\s/g, '');
    if (numero.length >= 4) {
      return `****${numero.slice(-4)}`;
    }
    return numeroTarjeta;
  }
}