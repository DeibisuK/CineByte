import {
  Component, OnInit, ChangeDetectorRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SedeService } from '@features/venues';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule
} from '@angular/forms';
//import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TemaService } from '../../../../cliente/features/movies/services/tema.service';
import Swal from 'sweetalert2';

// Configuración de iconos de Leaflet (mantenido igual)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'leaflet/marker-icon-2x.png',
  iconUrl: 'leaflet/marker-icon.png',
  shadowUrl: 'leaflet/marker-shadow.png',
});

@Component({
  selector: 'app-editar-sedes',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './editar-sedes.component.html',
  styleUrl: './editar-sedes.component.css'
})
export class EditarSedesComponent implements OnInit, AfterViewInit, OnDestroy {
  sedeForm!: FormGroup;
  map!: L.Map;
  marker!: L.Marker;
  estados = ['Activo', 'Inactivo', 'Mantenimiento', 'Pendiente', 'En Construccion'];
  private temaSubscription!: Subscription;

  constructor(
    private sedeService: SedeService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private temaService: TemaService
  ) { }

  ngOnInit(): void {
    this.temaSubscription = this.temaService.modoOscuro$.subscribe(
      (modoOscuro) => {
        // Puedes usar esto para configurar el tema de SweetAlert2 si lo deseas
      }
    );
    
    this.sedeForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      telefono: ['', [Validators.pattern(/^[\d\s\-]+$/), Validators.maxLength(15)]],
      email: ['', Validators.email],
      latitud: [0],
      longitud: [0],
      estado: ['Activo', Validators.required],
      ciudad: ['', Validators.required],
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.showErrorAlert('ID de sede no válido');
      this.router.navigate(['/admin/sedes']);
      return;
    }
    
    const id = Number(idParam);
    this.sedeService.getSedeById(id).subscribe({
      next: (data) => {
        const estadoValido = this.estados.includes(data.estado) ? data.estado : 'Activo';
        this.sedeForm.patchValue({
          ...data,
          estado: estadoValido
        });
        
        // Actualizar mapa si ya está inicializado
        if (this.map && this.marker) {
          this.updateMapPosition(data.latitud || -0.22985, data.longitud || -78.52495);
        }
      },
      error: (err) => {
        this.showErrorAlert('Error al cargar sede');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.temaSubscription) {
      this.temaSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }

  private initializeMap(): void {
    const lat = this.sedeForm?.value.latitud || -0.22985;
    const lng = this.sedeForm?.value.longitud || -78.52495;
    
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
      this.cdr.detectChanges();
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.marker.setLatLng(e.latlng);
      this.sedeForm.patchValue({ latitud: lat, longitud: lng });
      this.getDireccionDesdeCoordenadas(lat, lng);
      this.cdr.detectChanges();
    });
  }

  private updateMapPosition(lat: number, lng: number): void {
    if (this.map && this.marker) {
      const newLatLng = L.latLng(lat, lng);
      this.map.setView(newLatLng, 13);
      this.marker.setLatLng(newLatLng);
    }
  }

  onSubmit(): void {
    this.markFormGroupTouched(this.sedeForm);

    if (this.sedeForm.invalid) {
      this.showWarningAlert(
        'Por favor complete correctamente todos los campos requeridos',
        'Revise los campos marcados.'
      );
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    this.sedeService.editarSede(Number(id), this.sedeForm.value).subscribe({
      next: () => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Sede editada correctamente',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/admin/sedes']);
        });
      },
      error: (err) => {
        const errorMsg = err.error?.message || err.message || 'Error desconocido';
        this.showErrorAlert(`Error al editar la sede: ${errorMsg}`);
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

  private showErrorAlert(message: string): void {
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }

  private showWarningAlert(title: string, text: string): void {
    Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      confirmButtonText: 'Entendido'
    });
  }

  // Getters para los mensajes de error en el template
  get nombre() { return this.sedeForm.get('nombre')!; }
  get ciudad() { return this.sedeForm.get('ciudad')!; }
  get direccion() { return this.sedeForm.get('direccion')!; }
  get telefono() { return this.sedeForm.get('telefono')!; }
  get email() { return this.sedeForm.get('email')!; }
  get estado() { return this.sedeForm.get('estado')!; }

  private getDireccionDesdeCoordenadas(lat: number, lon: number): void {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data?.address) {
          const direccion = data.display_name;
          const ciudad = data.address.city || data.address.town || data.address.village || data.address.county;
          this.sedeForm.patchValue({
            direccion: direccion,
            ciudad: ciudad || '',
          });
        }
      })
      .catch((error) => {
        console.error('Error al obtener dirección desde coordenadas', error);
      });
  }
}