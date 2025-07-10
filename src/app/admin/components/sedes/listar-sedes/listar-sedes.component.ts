import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SedeService, Sede } from '@features/venues';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { AlertaService } from '@core/services';


@Component({
  selector: 'app-listar-sedes',
  imports: [CommonModule, RouterModule],
  templateUrl: './listar-sedes.component.html',
  styleUrls: ['./listar-sedes.component.css']
})
export class ListarSedesComponent implements OnInit {
  sedes: Sede[] = [];

  constructor(
    private sedeService: SedeService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private alerta: AlertaService
  ) { }

  ngOnInit(): void {
    this.cargarSedes();
  }



  isClientRoute(): boolean {
    return this.router.url.includes('/donde-estamos');
  }

  cargarSedes() {
    this.sedeService.getSedes().subscribe({
      next: (data) => {
        this.sedes = data;
      },
      error: (err) => {
        console.error('Error cargando sedes', err);
        this.alerta.error('Error', 'No se pudieron cargar las sedes');
      }
    });
  }

  getMapaUrl(lat: number = 0, lng: number = 0): SafeResourceUrl {
    const url = `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  editarSede(sede: Sede) {
    if (sede.id_sede !== undefined) {
      this.router.navigate(['/admin/sedes/edit', sede.id_sede]);
    }
  }

  eliminarSede(sede: Sede) {
    if (!sede.id_sede) return;
    
    this.alerta.confirmacion(
      '¿Estás seguro?',
      `¿Quieres eliminar la sede "${sede.nombre}"? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
      'Cancelar'
    ).then((result: { isConfirmed: boolean }) => {
      if (result.isConfirmed) {
        this.sedeService.eliminarSede(sede.id_sede!).subscribe({
          next: () => {
            this.sedes = this.sedes.filter(s => s.id_sede !== sede.id_sede);
            this.alerta.success('Eliminada', 'La sede ha sido eliminada correctamente');
          },
          error: (err) => {
            console.error('Error eliminando sede', err);
            this.alerta.error('Error', 'No se pudo eliminar la sede: ' + (err.error?.mensaje || 'Error desconocido'));
          }
        });
      }
    });
  }
}