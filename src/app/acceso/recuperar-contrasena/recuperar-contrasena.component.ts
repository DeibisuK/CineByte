import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-recuperar-contrasena',
  imports: [],
  templateUrl: './recuperar-contrasena.component.html',
  styleUrl: './recuperar-contrasena.component.css'
})
export class RecuperarContrasenaComponent {
   @Output() cerrar = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }
  cerrarModalRecuperacion(): void {
    this.cerrar.emit(); 
  }
  
  enviarSolicitudRecuperacion(): void {
    
    this.cerrarModalRecuperacion(); 
  }
}
