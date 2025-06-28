import {
  Component,
  OnInit,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Sede, SedeService } from '../../../../services/sede.service';
import { FormsModule } from '@angular/forms';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'leaflet/marker-icon-2x.png',
  iconUrl: 'leaflet/marker-icon.png',
  shadowUrl: 'leaflet/marker-shadow.png',
});

@Component({
  selector: 'app-editar-sedes',
  imports: [FormsModule, CommonModule],
  templateUrl: './editar-sedes.component.html',
  styleUrl: './editar-sedes.component.css'
})
export class EditarSedesComponent implements OnInit, AfterViewInit {
  sede: Sede = {
    id_sede: 0,
    nombre: '',
    id_ciudad: 1,
    direccion: '',
    estado: 'Activo',
    latitud: 0,
    longitud: 0,
    telefono: '',
    email: '',
  };

  ciudades: any[] = [];
  map!: L.Map;
  marker!: L.Marker;

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
    private cdr: ChangeDetectorRef
  ) {}

ngOnInit(): void {
  this.sedeService.getCiudades().subscribe((data) => {
    this.ciudades = data;
  });

  const idParam = this.route.snapshot.paramMap.get('id');
  if (!idParam) {
    alert('ID de sede no válido');
    this.router.navigate(['/admin/sedes']);
    return;
  }
  const id = Number(idParam);

  this.sedeService.getSedeById(id).subscribe((data) => {
    this.sede = data;
    if (this.map) {
      this.map.setView([this.sede.latitud ?? 0, this.sede.longitud ?? 0], 14);
      this.marker.setLatLng([this.sede.latitud ?? 0, this.sede.longitud ?? 0]);
    }
  });
}

  ngAfterViewInit(): void {
    // Si la sede ya tiene lat/lng, usar esos valores, si no, usar Machala
    const lat = this.sede.latitud || -3.258;
    const lng = this.sede.longitud || -79.955;
    this.map = L.map('map').setView([lat, lng], 13);
    this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.marker.on('dragend', () => {
      const { lat, lng } = this.marker.getLatLng();
      this.sede.latitud = lat;
      this.sede.longitud = lng;
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.marker.setLatLng(e.latlng);
      this.sede.latitud = e.latlng.lat;
      this.sede.longitud = e.latlng.lng;
    });

    this.cdr.detectChanges();
  }

  onCiudadChange(id_ciudad: number) {
    const coords = this.coordCiudades[id_ciudad];
    if (coords) {
      this.map.setView(coords, 14);
      this.marker.setLatLng(coords);
      this.sede.latitud = coords[0];
      this.sede.longitud = coords[1];
    } else {
      console.warn('Ciudad sin coordenadas definidas.');
    }
  }

  onSubmit() {
    this.sedeService.editarSede(this.sede.id_sede ?? 0, this.sede).subscribe({
      next: () => {
        alert('Sede editada correctamente');
        this.router.navigate(['/admin/sedes']);
      },
      error: () => alert('Error al editar la sede'),
    });
  }
}