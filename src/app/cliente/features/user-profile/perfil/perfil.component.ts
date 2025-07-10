import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import {
  Auth,
  User,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from '@angular/fire/auth';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { getIdTokenResult } from '@angular/fire/auth';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent implements OnInit {
  user: User | null = null;
  userRole: string = '';
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  isEditing = false;
  isChangingPassword = false;
  providerData: any[] = [];
  lastSignInTime: string = '';
  creationTime: string = '';
  showDefaultAvatar = false;

  constructor(
    private auth: Auth,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadUserData();
    this.initForms();
  }

  private async loadUserData() {
    await new Promise<void>((resolve) => {
      const unsubscribe = this.auth.onAuthStateChanged(async (user) => {
        this.user = user;
        if (user) {
          this.providerData = user.providerData;
          this.lastSignInTime = new Date(
            user.metadata.lastSignInTime || ''
          ).toLocaleString();
          this.creationTime = new Date(
            user.metadata.creationTime || ''
          ).toLocaleString();

          // Obtener el rol desde las claims del token
          try {
            const idTokenResult = await getIdTokenResult(user, true);
            this.userRole =
              (idTokenResult.claims['role'] as string) || 'cliente';
          } catch (error) {
            console.error('Error obteniendo rol:', error);
            this.userRole = 'cliente';
          }
        }
        if (this.user?.photoURL) {
          document.documentElement.style.setProperty(
            '--avatar-background',
            `url('${this.user.photoURL}')`
          );
        } else {
          document.documentElement.style.setProperty(
            '--avatar-background',
            'url("assets/images/default-avatar.png")'
          );
        }
        unsubscribe();
        resolve();
      });
    });
  }

  getProviderName(providerId: string): string {
    switch (providerId) {
      case 'google.com':
        return 'Google';
      case 'facebook.com':
        return 'Facebook';
      case 'password':
        return 'Email/Contraseña';
      default:
        return providerId;
    }
  }

  private initForms() {
    this.profileForm = this.fb.group({
      displayName: [this.user?.displayName || '', Validators.required],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  getProviderIcon(providerId: string): string {
    switch (providerId) {
      case 'google.com':
        return 'Autenticacion/google-color.svg';
      case 'facebook.com':
        return 'Autenticacion/facebook-color.svg';
      case 'password':
        return 'Autenticacion/email.svg';
      default:
        return 'Autenticacion/user-authentication.svg';
    }
  }
  handleImageError(event: any) {
    event.target.style.display = 'none';
    this.showDefaultAvatar = true;
  }
  canChangePassword(): boolean {
    return this.providerData.some(
      (provider) => provider.providerId === 'password'
    );
  }

  async updateProfile() {
    if (this.profileForm.invalid) return;

    try {
      await updateProfile(this.user!, {
        displayName: this.profileForm.value.displayName,
      });

      Swal.fire({
        icon: 'success',
        title: '¡Perfil actualizado!',
        text: 'Tu nombre se ha guardado correctamente',
        timer: 2000,
        showConfirmButton: false,
      });

      this.isEditing = false;
      await this.loadUserData();
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    }
  }

  async changePassword() {
    if (
      this.passwordForm.invalid ||
      this.passwordForm.value.newPassword !==
        this.passwordForm.value.confirmPassword
    ) {
      Swal.fire(
        'Error',
        'Las contraseñas no coinciden o no son válidas',
        'error'
      );
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        this.user?.email || '',
        this.passwordForm.value.currentPassword
      );

      await reauthenticateWithCredential(this.user!, credential);
      await updatePassword(this.user!, this.passwordForm.value.newPassword);

      Swal.fire({
        icon: 'success',
        title: '¡Contraseña actualizada!',
        text: 'Tu contraseña se ha cambiado correctamente',
        timer: 2000,
        showConfirmButton: false,
      });

      this.isChangingPassword = false;
      this.passwordForm.reset();
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    }
  }
}
