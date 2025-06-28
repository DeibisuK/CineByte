import { Component, OnInit } from '@angular/core';
import { SedeService, Sede } from '../../../../services/sede.service';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-listar-sedes',
  imports: [CommonModule],
  templateUrl: './listar-sedes.component.html',
  styleUrls: ['./listar-sedes.component.css']
})
export class ListarSedesComponent implements OnInit {
  sedes: Sede[] = [];

  ciudadesMap: { [id: number]: string } = {
    1: 'Quito',
    2: 'Guayaquil',
    3: 'Cuenca',
    4: 'Manta',
    5: 'Machala',
    6: 'Ambato',
    7: 'Riobamba',
    8: 'Loja',
    9: 'Ibarra',
    10: 'Esmeraldas',
    11: 'Babahoyo',
    12: 'Santa Elena',
    13: 'Santo Domingo'
  };

  constructor(
    private sedeService: SedeService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.cargarSedes();
  }

  cargarSedes() {
    this.sedeService.getSedes().subscribe(data => {
      this.sedes = data;
    });
  }

  getNombreCiudad(id: number): string {
    return this.ciudadesMap[id] || 'Ciudad desconocida';
  }

  getMapaUrl(lat: number = 0, lng: number = 0): SafeResourceUrl {
    // El z del URL es el zoom por default que aparece en el listado
    const url = `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  editarSede(sede: Sede) {
    console.log('Editar', sede);
  }

  eliminarSede(id: number) {
      if (confirm('¿Estás seguro de eliminar esta sede?')) {
        this.sedeService.eliminarSede(id).subscribe({
          next: () => {
            this.sedes = this.sedes.filter(s => s.id_sede !== id);
          },
          error: (err) => {
            alert('No se pudo eliminar la sede: ' + (err.error?.mensaje || 'Error desconocido'));
          }
        });
      }
    }
}
