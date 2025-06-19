import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../services/AuthService';

@Component({
  selector: 'app-recuperar-contrasena',
  templateUrl: './recuperar-contrasena.component.html',
  styleUrls: ['./recuperar-contrasena.component.css']
})
export class RecuperarContrasenaComponent {
  @Output() cerrar = new EventEmitter<void>();

  email: string = '';

  constructor(private authService: AuthService) { }

  cerrarModalRecuperacion(): void {
    this.cerrar.emit();
  }

  enviarSolicitudRecuperacion(): void {
    if (this.email) {
      this.authService.resetPassword(this.email)
        .then(() => {
          alert(`Se envió un correo de recuperación a: ${this.email}`);
          this.cerrarModalRecuperacion();
        })
        .catch(err => {
          console.error(err);
          alert(`Error al enviar correo: ${err.message}`);
        });
    } else {
      alert('Por favor, ingrese un correo válido.');
    }
  }
}
