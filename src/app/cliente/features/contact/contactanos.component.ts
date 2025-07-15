import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SedeService, Sede } from '@features/venues'; // Importar la interfaz Sede
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contactanos',
  templateUrl: './contactanos.component.html',
  styleUrls: ['./contactanos.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ]
})
export class ContactanosComponent implements OnInit {
  contactoForm: FormGroup;
  menuSedesAbiertoContacto = false;
  ciudadesConSedes: { nombre: string, sedes: Sede[] }[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private sedeService: SedeService
  ) {
    this.contactoForm = this.fb.group({
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      cine: [null, [Validators.required]], // Cambiado a null para objeto
      tipo: ['', [Validators.required]],
      comentario: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.cargarSedes();
  }

  cargarSedes() {
    this.sedeService.getSedes().subscribe({
      next: (sedes) => {
        this.ciudadesConSedes = this.agruparSedesPorCiudad(sedes);
      },
      error: (error) => {
        console.error('Error al cargar sedes:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar las sedes disponibles',
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
    });
  }

  agruparSedesPorCiudad(sedes: Sede[]): { nombre: string, sedes: Sede[] }[] {
    const ciudadesMap: { [ciudad: string]: { nombre: string, sedes: Sede[] } } = {};

    for (const sede of sedes) {
      const ciudadNombre = sede.ciudad?.trim() || 'Sin ciudad';

      if (!ciudadesMap[ciudadNombre]) {
        ciudadesMap[ciudadNombre] = { nombre: ciudadNombre, sedes: [] };
      }

      ciudadesMap[ciudadNombre].sedes.push(sede);
    }

    return Object.values(ciudadesMap);
  }

  toggleMenuSedesContacto() {
    this.menuSedesAbiertoContacto = !this.menuSedesAbiertoContacto;
  }

  seleccionarSedeContacto(sede: Sede) {
    this.contactoForm.get('cine')?.setValue(sede);
    this.menuSedesAbiertoContacto = false;
  }

  enviarContacto() {
    if (this.contactoForm.invalid) {
      this.contactoForm.markAllAsTouched();
      Swal.fire({
        title: 'Formulario incompleto',
        text: 'Por favor complete todos los campos requeridos correctamente',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#FFD700',
        background: 'var(--footer-esp)',
        color: 'var(--text-color)',
        customClass: {
          popup: 'swal-custom-popup'
        }
      });
      return;
    }

    const formData = {
      ...this.contactoForm.value,
      cine: this.contactoForm.value.cine.nombre,
      ciudad: this.contactoForm.value.cine.ciudad || 'Sin ciudad'
    };

    Swal.fire({
      title: 'Enviando mensaje...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      background: 'var(--footer-esp)',
      color: 'var(--text-color)',
      customClass: {
        popup: 'swal-custom-popup'
      }
    });

    this.http.post('https://api-cinebyte-akvqp.ondigitalocean.app/api/contacto', formData)
      .subscribe({
        next: () => {
          Swal.fire({
            title: '¡Mensaje enviado!',
            text: 'Hemos recibido tu mensaje correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#FFD700',
            background: 'var(--footer-esp)',
            color: 'var(--text-color)',
            customClass: {
              popup: 'swal-custom-popup'
            }
          });
          this.contactoForm.reset();
        },
        error: (error) => {
          console.error('Error al enviar:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo enviar el mensaje. Por favor intente nuevamente',
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
      });
  }
}