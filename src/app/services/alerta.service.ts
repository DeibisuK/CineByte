import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {

  constructor(private router: Router) { }

  // Detectar si está en modo claro
  private isLightMode(): boolean {
    return document.body.classList.contains('light-mode');
  }

  // Obtener configuración de tema personalizada
  private getThemeConfig() {
    const isLight = this.isLightMode();
    return {
      customClass: {
        popup: 'swal-custom-popup'
      },
      background: isLight ? '#f0f0f0' : '#1D1D1D',
      color: isLight ? '#121212' : '#ffffff',
      confirmButtonColor: isLight ? '#FFA500' : '#FFD700',
      cancelButtonColor: isLight ? '#6c757d' : '#d33'
    };
  }

  success(titulo: string, mensaje: string) {
    const config = this.getThemeConfig();
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: 'success',
      confirmButtonColor: config.confirmButtonColor,
      background: config.background,
      color: config.color,
      customClass: config.customClass
    });
  }

  successRoute(titulo: string, mensaje: string, ruta: string) {
    const config = this.getThemeConfig();
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: 'success',
      confirmButtonColor: config.confirmButtonColor,
      background: config.background,
      color: config.color,
      customClass: config.customClass
    }).then(() => {
      this.router.navigate(['/admin/' + ruta]);
    });
  }

  error(titulo: string, mensaje: string) {
    const config = this.getThemeConfig();
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: 'error',
      confirmButtonColor: '#f44336',
      background: config.background,
      color: config.color,
      customClass: config.customClass
    });
  }

  warning(titulo: string, mensaje: string) {
    const config = this.getThemeConfig();
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: 'warning',
      confirmButtonColor: '#ff9800',
      background: config.background,
      color: config.color,
      customClass: config.customClass
    });
  }

  info(titulo: string, mensaje: string) {
    const config = this.getThemeConfig();
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: 'info',
      confirmButtonColor: '#2196f3',
      background: config.background,
      color: config.color,
      customClass: config.customClass
    });
  }

  confirmacion(titulo: string, mensaje: string, confirmText = 'Aceptar', cancelText = 'Cancelar') {
    const config = this.getThemeConfig();
    return Swal.fire({
      title: titulo,
      text: mensaje,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: config.confirmButtonColor,
      cancelButtonColor: config.cancelButtonColor,
      background: config.background,
      color: config.color,
      customClass: config.customClass
    });
  }

  autoClose(titulo: string, mensaje: string, icon: SweetAlertIcon = 'success', tiempo = 2000) {
    const config = this.getThemeConfig();
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon,
      timer: tiempo,
      showConfirmButton: false,
      timerProgressBar: true,
      background: config.background,
      color: config.color,
      customClass: config.customClass
    });
  }
}
