import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { Auth, User, updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from '@angular/fire/auth';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/AuthService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})

export class PerfilComponent implements OnInit {
  user: User | null = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  isEditing = false;
  isChangingPassword = false;
  providerData: any[] = [];
  lastSignInTime: string = '';
  creationTime: string = '';

  constructor(
    private auth: Auth,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.initForms();
  }

  private async loadUserData() {
    this.user = this.auth.currentUser;
    
    // Si el usuario no está cargado, esperamos a que Auth se inicialice
    if (!this.user) {
      await new Promise(resolve => {
        const unsubscribe = this.auth.onAuthStateChanged(user => {
          this.user = user;
          unsubscribe();
          resolve(null);
        });
      });
    }
  
    if (this.user) {
      this.providerData = this.user.providerData;
      this.lastSignInTime = new Date(this.user.metadata.lastSignInTime || '').toLocaleString();
      this.creationTime = new Date(this.user.metadata.creationTime || '').toLocaleString();
      
      // Inicializar formulario con los nuevos datos
      this.initForms();
    }
  }
  
  private initForms() {
    this.profileForm = this.fb.group({
      displayName: [this.user?.displayName || '', Validators.required],
      email: [this.user?.email || '', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  async updateProfile() {
    if (this.profileForm.invalid) return;

    try {
      await updateProfile(this.user!, {
        displayName: this.profileForm.value.displayName
      });

      if (this.user?.email !== this.profileForm.value.email) {
        await updateEmail(this.user!, this.profileForm.value.email);
      }

      Swal.fire('¡Perfil actualizado!', 'Tus datos se han guardado correctamente', 'success');
      this.isEditing = false;
      this.loadUserData();
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    }
  }

  async changePassword() {
    if (this.passwordForm.invalid || 
        this.passwordForm.value.newPassword !== this.passwordForm.value.confirmPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden o no son válidas', 'error');
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        this.user?.email || '',
        this.passwordForm.value.currentPassword
      );
      
      await reauthenticateWithCredential(this.user!, credential);
      await updatePassword(this.user!, this.passwordForm.value.newPassword);
      
      Swal.fire('¡Contraseña actualizada!', 'Tu contraseña se ha cambiado correctamente', 'success');
      this.isChangingPassword = false;
      this.passwordForm.reset();
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    }
  }


  getProviderIcon(providerId: string): string {
    switch(providerId) {
      case 'google.com': 
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4285F4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21.8 10H12v4h5.7c-.8 2.3-3 4-5.7 4-3.3 0-6-2.7-6-6s2.7-6 6-6c1.6 0 3 .6 4 1.6l2.8-2.8C16.2 3.1 14.2 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10c0-.7-.1-1.4-.2-2z"/>
                </svg>`;
      case 'facebook.com': 
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" stroke="#1877F2" stroke-width="1">
                  <path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7C18.3 21.1 22 17 22 12z"/>
                </svg>`;
      case 'password': 
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFA500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>`;
      default: 
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>`;
    }
  }

  canChangePassword(): boolean {
    return this.providerData.some(provider => provider.providerId === 'password');
  }
}