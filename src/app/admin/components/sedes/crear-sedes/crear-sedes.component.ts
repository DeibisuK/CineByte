import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { SedeService } from '@features/venues/services/sede.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
//import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TemaService } from '../../../../cliente/features/movies/services/tema.service';
import Swal from 'sweetalert2';

// Configuración de iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'leaflet/marker-icon-2x.png',
  iconUrl: 'leaflet/marker-icon.png',
  shadowUrl: 'leaflet/marker-shadow.png',
});

@Component({
  selector: 'app-crear-sedes',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './crear-sedes.component.html',
  styleUrl: './crear-sedes.component.css',
})
export class CrearSedesComponent implements OnInit, AfterViewInit, OnDestroy {
  sedeForm: FormGroup;
  ciudades: any[] = [];
  estados = ['Activo', 'Inactivo', 'Mantenimiento', 'Pendiente', 'En Construccion'];
  map!: L.Map;
  marker!: L.Marker;
  private temaSubscription!: Subscription;

  constructor(
    private sedeService: SedeService,
    private temaService: TemaService,
    private fb: FormBuilder
  ) {
    this.sedeForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      ciudad: ['', Validators.required],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      telefono: ['', [Validators.pattern(/^[\d\s\-]+$/), Validators.maxLength(15)]],
      email: ['', Validators.email],
      latitud: [0],
      longitud: [0],
      estado: ['Activo', Validators.required],
    });
  }

  get nombre() {
    const control = this.sedeForm.get('nombre');
    if (!control) throw new Error('Control "nombre" no encontrado');
    return control;
  }

  get direccion() {
    const control = this.sedeForm.get('direccion');
    if (!control) throw new Error('Control "direccion" no encontrado');
    return control;
  }

  get telefono() {
    const control = this.sedeForm.get('telefono');
    if (!control) throw new Error('Control "telefono" no encontrado');
    return control;
  }

  get email() {
    const control = this.sedeForm.get('email');
    if (!control) throw new Error('Control "email" no encontrado');
    return control;
  }

  get latitud(): number {
    return this.sedeForm.get('latitud')?.value || 0;
  }

  get longitud(): number {
    return this.sedeForm.get('longitud')?.value || 0;
  }

  ngOnInit(): void {
    this.temaSubscription = this.temaService.modoOscuro$.subscribe();
  }

  ngOnDestroy(): void {
    if (this.temaSubscription) {
      this.temaSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    const coords: [number, number] = [-0.22985, -78.52495]; // Fallback Quito

    this.map = L.map('map').setView(coords, 13);
    this.marker = L.marker(coords, { draggable: true }).addTo(this.map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    const updateLocation = (lat: number, lng: number) => {
      this.sedeForm.patchValue({ latitud: lat, longitud: lng });
      this.getDireccionDesdeCoordenadas(lat, lng);
    };

    this.marker.on('dragend', () => {
      const { lat, lng } = this.marker.getLatLng();
      updateLocation(lat, lng);
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.marker.setLatLng(e.latlng);
      updateLocation(lat, lng);
    });

    // Inicial
    setTimeout(() => {
      this.sedeForm.patchValue({ latitud: coords[0], longitud: coords[1] });
      this.getDireccionDesdeCoordenadas(coords[0], coords[1]);
    });
  }

  onSubmit(): void {
    this.markFormGroupTouched(this.sedeForm);

    if (this.sedeForm.invalid) {
      Swal.fire({
        title: 'Formulario incompleto',
        text: 'Por favor complete correctamente todos los campos requeridos. Revise los campos marcados.',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    this.sedeService.crearSede(this.sedeForm.value).subscribe({
      next: () => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Sede creada correctamente',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          this.resetForm();
        });
      },
      error: (err) => {
        const errorMsg = err.error?.message || err.message || 'Error desconocido';
        Swal.fire({
          title: 'Error',
          text: `Error al crear sede: ${errorMsg}`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      },
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private resetForm(): void {
    this.sedeForm.reset({
      ciudad: '',
      direccion: '',
      estado: 'Activo',
      latitud: 0,
      longitud: 0,
    });
    const defaultCoords: [number, number] = [-0.22985, -78.52495];
    this.map.setView(defaultCoords, 13);
    this.marker.setLatLng(defaultCoords);
    this.getDireccionDesdeCoordenadas(defaultCoords[0], defaultCoords[1]);
  }

  private getDireccionDesdeCoordenadas(lat: number, lon: number): void {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data?.address) {
          const direccion = data.display_name;
          const ciudad = data.address.city || data.address.town || data.address.village || data.address.county;

          setTimeout(() => {
            this.sedeForm.patchValue({
              direccion: direccion,
              ciudad: ciudad || '',
            });
          });
        }
      })
      .catch((error) => {
        console.error('Error al obtener dirección desde coordenadas', error);
      });
  }
}