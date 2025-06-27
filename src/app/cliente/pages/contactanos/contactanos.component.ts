import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Contacto } from '../../../core/models/contact.model';

@Component({
  selector: 'app-contactanos',
  imports: [FormsModule],
  templateUrl: './contactanos.component.html',
  styleUrl: './contactanos.component.css'
})
export class ContactanosComponent {
  contacto: Contacto = {
    nombres: '',
    apellidos: '',
    telefono: '',
    email: '',
    cine: '',
    tipo: '',
    comentario: ''
  };

  constructor(private http: HttpClient) {}

  enviarContacto() {
    this.http.post('http://localhost:3000/api/contacto', this.contacto)
      .subscribe({
        next: () => alert('Mensaje enviado correctamente'),
        error: () => alert('Error al enviar el mensaje')
      });
  }

}
