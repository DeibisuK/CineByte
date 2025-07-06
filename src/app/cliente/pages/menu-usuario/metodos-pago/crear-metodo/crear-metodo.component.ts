import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-metodo',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './crear-metodo.component.html',
  styleUrl: './crear-metodo.component.css'
})
export class CrearMetodoComponent implements OnInit {
  @Input() isModalOpen: boolean = false;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() cardAdded = new EventEmitter<any>();

  cardForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.cardForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.minLength(13)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]]
    });
  }

  ngOnInit() {}

  closeModal() {
    this.isModalOpen = false;
    this.modalClosed.emit();
    this.cardForm.reset();
  }

  addCard() {
    if (this.cardForm.valid) {
      const cardData = this.cardForm.value;
      
      // Mostrar SweetAlert2 de éxito
      Swal.fire({
        title: '¡Tarjeta agregada!',
        text: 'Tu tarjeta ha sido agregada exitosamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#FFD700',
        background: 'var(--footer-esp)',
        color: 'var(--text-color)',
        customClass: {
          popup: 'swal-custom-popup'
        }
      }).then(() => {
        this.cardAdded.emit(cardData);
        this.closeModal();
      });
    } else {
      // Mostrar SweetAlert2 de error
      Swal.fire({
        title: 'Error',
        text: 'Por favor, completa todos los campos correctamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#FFD700',
        background: 'var(--footer-esp)',
        color: 'var(--text-color)',
        customClass: {
          popup: 'swal-custom-popup'
        }
      });
    }
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = value.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      value = parts.join(' ');
    }
    
    event.target.value = value;
    this.cardForm.patchValue({ cardNumber: value });
  }

  formatExpiryDate(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    event.target.value = value;
    this.cardForm.patchValue({ expiryDate: value });
  }
}
