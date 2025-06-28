import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Sede, SedeService } from '../../../../services/sede.service';
import { FormsModule } from '@angular/forms';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'leaflet/marker-icon-2x.png',
  iconUrl: 'leaflet/marker-icon.png',
  shadowUrl: 'leaflet/marker-shadow.png'
});
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-crear-sedes',
  imports: [FormsModule, CommonModule],
  templateUrl: './crear-sedes.component.html',
  styleUrl: './crear-sedes.component.css'
})
export class CrearSedesComponent implements OnInit, AfterViewInit {
  sede: Sede = {
    nombre: '',
    id_ciudad: 1,
    direccion: '',
    estado: 'Activo',
    latitud: 0,
    longitud: 0,
    telefono: '',
    email: ''
  };

  ciudades: any[] = [];
  map!: L.Map;
  marker!: L.Marker;

  coordCiudades: { [id: number]: [number, number] } = {
    1: [-0.22985, -78.52495],       // Quito
    2: [-2.170998, -79.922359],     // Guayaquil
    3: [-2.90055, -79.00453],       // Cuenca
    4: [-0.96769, -80.70891],       // Manta
    5: [-3.258, -79.955],           // Machala
    6: [-1.25434, -78.62289],       // Ambato
    7: [-1.66472, -78.65459],       // Riobamba
    8: [-3.99313, -79.20422],       // Loja
    9: [0.35171, -78.12233],        // Ibarra
   10: [0.96818, -79.65172],        // Esmeraldas
   11: [-1.80217, -79.53447],       // Babahoyo
   12: [-2.22494, -80.85949],       // Santa Elena
   13: [-0.25342, -79.17195]        // Santo Domingo
  };


  constructor(private sedeService: SedeService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.sedeService.getCiudades().subscribe(data => {
      this.ciudades = data;
      console.log('Ciudades cargadas:', this.ciudades);
    });

  }

  ngAfterViewInit(): void {
  this.map = L.map('map').setView([-3.258, -79.955], 13);
  this.marker = L.marker([-3.258, -79.955], { draggable: true }).addTo(this.map);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(this.map);

  this.sede.latitud = -3.258;
  this.sede.longitud = -79.955;
  this.cdr.detectChanges(); // <--- AGREGAR ESTO

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
    this.sedeService.crearSede(this.sede).subscribe({
      next: () => alert('Sede creada correctamente'),
      error: () => alert('Error al crear la sede')
    });
  }
}