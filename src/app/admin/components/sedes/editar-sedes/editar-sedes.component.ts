import {
  Component, OnInit, ChangeDetectorRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Sede, SedeService } from '../../../../services/sede.service';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule
} from '@angular/forms';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { AlertComponent } from '../../../../shared/alert/alert.component';
import { Subscription } from 'rxjs';
import { TemaService } from '../../../../cliente/features/movies/services/tema.service';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'leaflet/marker-icon-2x.png',
  iconUrl: 'leaflet/marker-icon.png',
  shadowUrl: 'leaflet/marker-shadow.png',
});

@Component({
  selector: 'app-editar-sedes',
  imports: [ReactiveFormsModule, CommonModule, AlertComponent],
  templateUrl: './editar-sedes.component.html',
  styleUrl: './editar-sedes.component.css'
})
export class EditarSedesComponent implements OnInit, AfterViewInit, OnDestroy {
  sedeForm!: FormGroup;
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
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private temaService: TemaService // <-- AGREGA ESTO
  ) {}

  ngOnInit(): void {
    this.temaSubscription = this.temaService.modoOscuro$.subscribe(
      (modoOscuro) => {
        this.alertTheme = modoOscuro ? 'dark' : 'light';
      }
    );
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

    this.sedeService.getCiudades().subscribe((data) => {
      this.ciudades = data;
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.showAlertMessage('ID de sede no válido', 'error');
      this.router.navigate(['/admin/sedes']);
      return;
    }
    const id = Number(idParam);

    this.sedeService.getSedeById(id).subscribe((data) => {
      this.sedeForm.patchValue(data);
      if (this.map) {
        this.map.setView([data.latitud ?? 0, data.longitud ?? 0], 14);
        this.marker.setLatLng([data.latitud ?? 0, data.longitud ?? 0]);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.temaSubscription) {
      this.temaSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    const lat = this.sedeForm?.value.latitud || -3.258;
    const lng = this.sedeForm?.value.longitud || -79.955;
    this.map = L.map('map').setView([lat, lng], 13);
    this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);

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

    this.cdr.detectChanges();
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
    this.markFormGroupTouched(this.sedeForm);

    if (this.sedeForm.invalid) {
      this.showAlertMessage(
        'Por favor complete correctamente todos los campos requeridos. Revise los campos marcados.',
        'warning'
      );
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    this.sedeService.editarSede(Number(id), this.sedeForm.value).subscribe({
      next: () => {
        this.showAlertMessage('Sede editada correctamente', 'success');
        setTimeout(() => this.router.navigate(['/admin/sedes']), 1200);
      },
      error: (err) => {
        const errorMsg =
          err.error?.message || err.message || 'Error desconocido';
        this.showAlertMessage(`Error al editar la sede: ${errorMsg}`, 'error');
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

  private showAlertMessage(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info'
  ): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
  }

  // Getters para los mensajes de error en el template
  get nombre() { return this.sedeForm.get('nombre')!; }
  get id_ciudad() { return this.sedeForm.get('id_ciudad')!; }
  get direccion() { return this.sedeForm.get('direccion')!; }
  get telefono() { return this.sedeForm.get('telefono')!; }
  get email() { return this.sedeForm.get('email')!; }
}