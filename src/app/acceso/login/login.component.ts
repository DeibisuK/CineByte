import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, ViewEncapsulation, inject, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // <-- Importaciones clave
import { RecuperarContrasenaComponent } from '../recuperar-contrasena/recuperar-contrasena.component';
import { AuthService } from '@core/services';
import { Route, Router } from '@angular/router';
import { updateProfile } from 'firebase/auth';
import { AlertaService } from '@core/services';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    //RecuperarContrasenaComponent,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  encapsulation: ViewEncapsulation.ShadowDom
})
export class LoginComponent {

  @Input() showLoginRegisterModal: boolean = false;
  @Output() cerrarLoginRegister = new EventEmitter<void>();

  isLoginActive: boolean = true;
  showRecoverPasswordModal: boolean = false;
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  isRegisterMode = true;
  leftTitle: string = '¡Bienvenido!';
  leftText: string = 'Regístrate con tus datos para poder unirte a nuestro proyecto de Cinebyte';
  switchBtnText: string = 'INICIAR SESIÓN';
  rightTitle: string = 'Crear Cuenta';

  readonly authService = inject(AuthService);



  constructor(private router: Router, private alerta: AlertaService) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });

    this.registerForm = new FormGroup({
      username: new FormControl('', [
        Validators.required, 
        Validators.maxLength(30)
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  toggleForm() {
    this.isRegisterMode = !this.isRegisterMode;
    this.updateFormContent(this.isRegisterMode);
  }

  updateFormContent(toRegister: boolean) {
    if (toRegister) {
      this.leftTitle = '¡Bienvenido!';
      this.leftText = 'Regístrate con tus datos para poder unirte a nuestro proyecto de Cinebyte';
      this.switchBtnText = 'INICIAR SESIÓN';
      this.rightTitle = 'Crear Cuenta';
    } else {
      this.leftTitle = '¡Hola de nuevo!';
      this.leftText = 'Ingresa tus datos para acceder a tu cuenta y seguir disfrutando de Cinebyte';
      this.switchBtnText = 'REGISTRARSE';
      this.rightTitle = 'Iniciar Sesión';
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

  async onLoginSubmit(): Promise<void> {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.value;

    try {
      await this.authService.loginEmail(email, password);
      await this.authService.refreshRole();

      const role = this.authService.getRole();

      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: `Has iniciado sesión correctamente`,
        timer: 2000,
        showConfirmButton: false
      });

      this.cerrarLoginRegisterModal();

      if (role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/']);
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error al iniciar sesión',
        text: err.message || err
      });
    }
  }

  async onRegisterSubmit(): Promise<void> {
    if (!this.registerForm.valid) {
      if (this.registerForm.get('username')?.value?.length > 30) {
        Swal.fire({
          icon: 'error',
          title: 'Nombre de usuario demasiado largo',
          text: 'El nombre de usuario no puede exceder los 30 caracteres'
        });
        return;
      }
      this.registerForm.markAllAsTouched();
      return;
    }
    if (!this.registerForm.valid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { username, email, password } = this.registerForm.value;

    try {
      const cred = await this.authService.registerEmail(email, password);
      await updateProfile(cred.user, {
        displayName: username
      });

      Swal.fire({
        icon: 'success',
        title: '¡Registro exitoso!',
        text: `Bienvenido, ${username}`,
        timer: 2000,
        showConfirmButton: false
      });

      this.cerrarLoginRegisterModal();
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error al registrarse',
        text: err.message || err
      });
    }
  }
  async loginWithGoogle(): Promise<void> {
    try {
      await this.authService.loginGoogle();
      await this.authService.refreshRole();

      const role = this.authService.getRole();

      Swal.fire({
        icon: 'success',
        title: 'Login con Google exitoso',
        timer: 2000,
        showConfirmButton: false
      });

      this.cerrarLoginRegisterModal();

      if (role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/']);
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error con Google',
        text: err.message || err
      });
    }
  }
  async loginWithFacebook(): Promise<void> {
    try {
      await this.authService.loginFacebook();
      await this.authService.refreshRole();

      const role = this.authService.getRole();

      Swal.fire({
        icon: 'success',
        title: 'Login con Facebook exitoso',
        timer: 2000,
        showConfirmButton: false
      });

      this.cerrarLoginRegisterModal();

      if (role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/']);
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error con Facebook',
        text: err.message || err
      });
    }
  }


}