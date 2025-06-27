import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { AlertComponent } from '../../../shared/alert/alert.component';

@Component({
  selector: 'app-contactanos',
  templateUrl: './contactanos.component.html',
  styleUrl: './contactanos.component.css',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    AlertComponent
  ]
})

export class ContactanosComponent {
  contactoForm: FormGroup;
  showAlert = false;
  alertMessage = '';
  alertTheme: 'light' | 'dark' = 'light';
  alertType: 'success' | 'error' | 'warning' | 'info' = 'success';


  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.contactoForm = this.fb.group({
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      cine: ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      comentario: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  enviarContacto() {
    if (this.contactoForm.invalid) {
      this.contactoForm.markAllAsTouched();
      return;
    }
    this.http.post('http://localhost:3000/api/contacto', this.contactoForm.value)
      .subscribe({
        next: () => {
          this.alertMessage = 'Mensaje enviado correctamente';
          this.alertTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
          this.showAlert = true;
          this.alertType = 'success';
          this.contactoForm.reset();
        },
        error: () => {
          this.alertMessage = 'Error al enviar el mensaje';
          this.alertTheme = 'dark';
          this.alertType = 'error';
          this.showAlert = true;
        }
      });
  }
}