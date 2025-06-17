import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // <-- Importaciones clave
import { RecuperarContrasenaComponent } from '../recuperar-contrasena/recuperar-contrasena.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RecuperarContrasenaComponent,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  encapsulation:ViewEncapsulation.ShadowDom
})
export class LoginComponent implements OnInit {

  @Input() showLoginRegisterModal: boolean = false;
  @Output() cerrarLoginRegister = new EventEmitter<void>();

  isLoginActive: boolean = true;
  showRecoverPasswordModal: boolean = false;

  // NUEVAS PROPIEDADES PARA FORMULARIOS REACTIVOS
  loginForm!: FormGroup; // Define el FormGroup para el formulario de login
  registerForm!: FormGroup; // Define el FormGroup para el formulario de registro

  constructor() { }

  ngOnInit(): void {
    // Inicializa los formularios en ngOnInit
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });

    this.registerForm = new FormGroup({
      username: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  toggleView() {
    this.isLoginActive = !this.isLoginActive;
    // Opcional: Resetear los formularios al cambiar de vista
    if (this.isLoginActive) { // Si pasamos a registro
      this.loginForm.reset();
    } else { // Si pasamos a login
      this.registerForm.reset();
    }
  }

  cerrarLoginRegisterModal() {
    this.cerrarLoginRegister.emit();
    // Opcional: Resetear formularios al cerrar el modal principal
    this.loginForm.reset();
    this.registerForm.reset();
  }

  abrirRecuperarContrasena(): void {
    this.showLoginRegisterModal = false;
    this.showRecoverPasswordModal = true;
    this.loginForm.reset(); // Opcional: Resetear el formulario de login al ir a recuperar
  }

  cerrarRecuperarContrasena(): void {
    this.showRecoverPasswordModal = false;
    this.showLoginRegisterModal = true;
    this.isLoginActive = true;
  }

  // M\u00C9TODOS PARA MANEJAR EL ENV\u00CDO DE FORMULARIOS REACTIVOS

  onLoginSubmit(): void {
    if (this.loginForm.valid) {
      console.log('Login Form Data:', this.loginForm.value);
      // Aqu\u00ED llamar\u00EDas a tu servicio de autenticaci\u00F3n
      alert('Login exitoso (simulado) para: ' + this.loginForm.value.email);
      this.cerrarLoginRegisterModal(); // Cierra el modal despu\u00E9s del login exitoso
    } else {
      console.log('Login Form is Invalid!');
      alert('Por favor, completa el formulario de login correctamente.');
      // Opcional: Marcar todos los controles como 'touched' para mostrar los errores
      this.loginForm.markAllAsTouched();
    }
  }

  onRegisterSubmit(): void {
    if (this.registerForm.valid) {
      console.log('Register Form Data:', this.registerForm.value);
      // Aqu\u00ED llamar\u00EDas a tu servicio de registro de usuarios
      alert('Registro exitoso (simulado) para: ' + this.registerForm.value.username);
      this.cerrarLoginRegisterModal(); // Cierra el modal despu\u00E9s del registro exitoso
    } else {
      console.log('Register Form is Invalid!');
      alert('Por favor, completa el formulario de registro correctamente.');
      // Opcional: Marcar todos los controles como 'touched' para mostrar los errores
      this.registerForm.markAllAsTouched();
    }
  }
}