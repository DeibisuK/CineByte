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

  constructor(private sedeService: SedeService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.sedeService.getCiudades().subscribe(data => {
      this.ciudades = data;
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


  onCiudadChange(id_ciudad: number | string) {
    const id = Number(id_ciudad); // <-- Asegura que sea número
    const ciudad = this.ciudades.find(c => c.id_ciudad === id);
    console.log('Ciudad seleccionada:', ciudad);
  
    if (ciudad?.latitud && ciudad?.longitud) {
      const coords: [number, number] = [ciudad.latitud, ciudad.longitud];
      this.map.setView(coords, 14);
      this.marker.setLatLng(coords);
      this.sede.latitud = coords[0];
      this.sede.longitud = coords[1];
    }
  }
  

  onSubmit() {
    this.sedeService.crearSede(this.sede).subscribe({
      next: () => alert('Sede creada correctamente'),
      error: () => alert('Error al crear la sede')
    });
  }
}