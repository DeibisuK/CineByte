import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import {SedeService } from '../../../../services/sede.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'leaflet/marker-icon-2x.png',
  iconUrl: 'leaflet/marker-icon.png',
  shadowUrl: 'leaflet/marker-shadow.png',
});
import { CommonModule } from '@angular/common';
import { AlertComponent } from '../../../../shared/alert/alert.component';
import { Subscription } from 'rxjs';
import { TemaService } from '../../../../cliente/features/movies/services/tema.service';

@Component({
  selector: 'app-crear-sedes',
  imports: [ReactiveFormsModule, CommonModule, AlertComponent],
  templateUrl: './crear-sedes.component.html',
  styleUrl: './crear-sedes.component.css',
})
export class CrearSedesComponent implements OnInit, AfterViewInit, OnDestroy {
  sedeForm: FormGroup;
  ciudades: any[] = [];
  map!: L.Map;
  marker!: L.Marker;
  showAlert = false;
  alertMessage = '';
  alertTheme: 'light' | 'dark' = 'light';
  alertType: 'success' | 'error' | 'warning' | 'info' = 'success';
  private temaSubscription!: Subscription;

  coordCiudades: { [id: number]: [number, number] } = {
    1: [-0.22985, -78.52495], // Quito
    2: [-2.170998, -79.922359], // Guayaquil
    3: [-2.90055, -79.00453], // Cuenca
    4: [-0.96769, -80.70891], // Manta
    5: [-3.258, -79.955], // Machala
    6: [-1.25434, -78.62289], // Ambato
    7: [-1.66472, -78.65459], // Riobamba
    8: [-3.99313, -79.20422], // Loja
    9: [0.35171, -78.12233], // Ibarra
    10: [0.96818, -79.65172], // Esmeraldas
    11: [-1.80217, -79.53447], // Babahoyo
    12: [-2.22494, -80.85949], // Santa Elena
    13: [-0.25342, -79.17195], // Santo Domingo
  };

  constructor(
    private sedeService: SedeService,
    private temaService: TemaService,
    private fb: FormBuilder
  ) {
    this.sedeForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      id_ciudad: [1, Validators.required],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      telefono: [
        '',
        [Validators.pattern(/^[\d\s\-]+$/), Validators.maxLength(15)],
      ],
      email: ['', Validators.email],
      latitud: [0],
      longitud: [0],
      estado: ['Activo'],
    });
  }

  // Getters para acceder fácilmente a los controles del formulario
  // Getters con comprobación de nulidad
  get nombre() {
    const control = this.sedeForm.get('nombre');
    if (!control) throw new Error('Control "nombre" no encontrado');
    return control;
  }

  get id_ciudad() {
    const control = this.sedeForm.get('id_ciudad');
    if (!control) throw new Error('Control "id_ciudad" no encontrado');
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

  ngOnInit(): void {
    this.temaSubscription = this.temaService.modoOscuro$.subscribe(
      (modoOscuro) => {
        this.alertTheme = modoOscuro ? 'dark' : 'light';
      }
    );
    this.sedeService.getCiudades().subscribe((data) => {
      this.ciudades = data;
    });
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
    this.map = L.map('map').setView([-3.258, -79.955], 13);
    this.marker = L.marker([-3.258, -79.955], { draggable: true }).addTo(
      this.map
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.marker.on('dragend', () => {
      const { lat, lng } = this.marker.getLatLng();
      this.sedeForm.patchValue({
        latitud: lat,
        longitud: lng,
      });
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.marker.setLatLng(e.latlng);
      this.sedeForm.patchValue({
        latitud: e.latlng.lat,
        longitud: e.latlng.lng,
      });
    });
  }

  onCiudadChange(id_ciudad: number): void {
    const coords = this.coordCiudades[id_ciudad];
    if (coords) {
      this.map.setView(coords, 14);
      this.marker.setLatLng(coords);
      this.sedeForm.patchValue({
        latitud: coords[0],
        longitud: coords[1],
      });
    }
  }

  onSubmit(): void {
    // Marca todos los controles como touched para mostrar errores
    this.markFormGroupTouched(this.sedeForm);

    if (this.sedeForm.invalid) {
      // Encuentra el primer control inválido para debug
      const invalidFields = Object.keys(this.sedeForm.controls).filter(
        (key) => this.sedeForm.get(key)?.invalid
      );

      console.log('Campos inválidos:', invalidFields);

      this.showAlertMessage(
        'Por favor complete correctamente todos los campos requeridos. Revise los campos marcados.',
        'warning'
      );
      return;
    }

    this.sedeService.crearSede(this.sedeForm.value).subscribe({
      next: () => {
        this.showAlertMessage('Sede creada correctamente', 'success');
        this.resetForm();
      },
      error: (err) => {
        const errorMsg =
          err.error?.message || err.message || 'Error desconocido';
        this.showAlertMessage(`Error al crear sede: ${errorMsg}`, 'error');
      },
    });
  }

  // Método auxiliar para marcar todos los controles como touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private showAlertMessage(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info'
  ): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
  }

  private resetForm(): void {
    this.sedeForm.reset({
      id_ciudad: 1,
      estado: 'Activo',
      latitud: 0,
      longitud: 0,
    });
    this.map.setView([-3.258, -79.955], 13);
    this.marker.setLatLng([-3.258, -79.955]);
  }
}
