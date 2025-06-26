import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {

  success(titulo: string, mensaje: string) {
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: 'success',
      confirmButtonColor: '#4CAF50'
    });
  }

  error(titulo: string, mensaje: string) {
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: 'error',
      confirmButtonColor: '#f44336'
    });
  }

  warning(titulo: string, mensaje: string) {
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: 'warning',
      confirmButtonColor: '#ff9800'
    });
  }

  info(titulo: string, mensaje: string) {
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: 'info',
      confirmButtonColor: '#2196f3'
    });
  }

  confirmacion(titulo: string, mensaje: string, confirmText = 'Aceptar', cancelText = 'Cancelar') {
    return Swal.fire({
      title: titulo,
      text: mensaje,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    });
  }

  autoClose(titulo: string, mensaje: string, icon: SweetAlertIcon = 'success', tiempo = 2000) {
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon,
      timer: tiempo,
      showConfirmButton: false,
      timerProgressBar: true
    });
  }
}
