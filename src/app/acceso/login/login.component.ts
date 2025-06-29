import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // <-- Importaciones clave
import { RecuperarContrasenaComponent } from '../recuperar-contrasena/recuperar-contrasena.component';
import { AuthService } from '../../services/AuthService';

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
  encapsulation: ViewEncapsulation.ShadowDom
})
export class LoginComponent implements OnInit {

  @Input() showLoginRegisterModal: boolean = false;
  @Output() cerrarLoginRegister = new EventEmitter<void>();

  isLoginActive: boolean = true;
  showRecoverPasswordModal: boolean = false;

  loginForm!: FormGroup;
  registerForm!: FormGroup;

  // ✅ Usa readonly y NO this para inyección
  readonly authService = inject(AuthService);

  constructor() { }

  ngOnInit(): void {
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
    if (this.isLoginActive) {
      this.loginForm.reset();
    } else {
      this.registerForm.reset();
    }
  }

  cerrarLoginRegisterModal() {
    this.cerrarLoginRegister.emit();
    this.loginForm.reset();
    this.registerForm.reset();
  }

  abrirRecuperarContrasena(): void {
    this.showLoginRegisterModal = false;
    this.showRecoverPasswordModal = true;
    this.loginForm.reset();
  }



  cerrarRecuperarContrasena(): void {
    this.showRecoverPasswordModal = false;
    this.showLoginRegisterModal = true;
    this.isLoginActive = true;
  }

  // ✅ Formulario de Login con AuthService
  onLoginSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.loginEmail(email, password)
        .then(() => {
          alert('Login exitoso');
          this.cerrarLoginRegisterModal();
        })
        .catch(err => {
          console.error(err);
          alert('Error de login: ' + (err.message || err));
        });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  // ✅ Formulario de Registro con AuthService
  onRegisterSubmit(): void {
    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;
      this.authService.registerEmail(email, password)
        .then(() => {
          alert('Registro exitoso');
          this.cerrarLoginRegisterModal();
        })
        .catch(err => {
          console.error(err);
          alert('Error de registro: ' + (err.message || err));
        });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }



  // ✅ Login con Google
  loginWithGoogle(): void {
    this.authService.loginGoogle()
      .then(() => {
        alert('Login con Google exitoso');
        this.cerrarLoginRegisterModal();
      })
      .catch(err => {
        console.error(err);
        alert('Error con Google: ' + (err.message || err));
      });
  }

  // ✅ Login con Facebook
  loginWithFacebook(): void {
    this.authService.loginFacebook()
      .then(() => {
        alert('Login con Facebook exitoso');
        this.cerrarLoginRegisterModal();
      })
      .catch(err => {
        console.error(err);
        alert('Error con Facebook: ' + (err.message || err));
      });
  }

}