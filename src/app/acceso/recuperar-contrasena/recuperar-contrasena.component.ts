// recuperar-contrasena.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recuperar-contrasena',
  templateUrl: './recuperar-contrasena.component.html',
  styleUrls: ['./recuperar-contrasena.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]  
})
export class RecuperarContrasenaComponent {
  @Output() cerrar = new EventEmitter<void>();
  email: string = '';

  constructor(private authService: AuthService) {}

  cerrarModalRecuperacion(): void {
    this.cerrar.emit();
  }

  enviarSolicitudRecuperacion(): void {
    if (this.email) {
      this.authService.resetPassword(this.email)
        .then(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Correo enviado!',
            html: `
              <p>Se ha enviado un correo de recuperación a:</p>
              <strong>${this.email}</strong>
              <br><br>
              <p>Si no encuentras el correo en tu bandeja de entrada, <strong>revisa tu carpeta de spam</strong>.</p>
            `,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#FFD700'
          });
          this.cerrarModalRecuperacion();
        })
        .catch(err => {
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'Error al enviar correo',
            text: err.message || 'Ocurrió un error inesperado',
            confirmButtonText: 'Intentar de nuevo',
            confirmButtonColor: '#FFD700'
          });
        });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Correo requerido',
        text: 'Por favor, ingresa un correo electrónico válido.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#FFD700'
      });
    }
  }
}
