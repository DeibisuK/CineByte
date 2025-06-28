import { Component, OnInit } from '@angular/core';
import { SedeService, Sede } from '../../../../services/sede.service';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { TemaService } from '../../../../cliente/features/movies/services/tema.service';
import { Subscription } from 'rxjs';
import { AlertConfirmComponent } from '../../../../shared/alert-confirm/alert-confirm.component';


@Component({
  selector: 'app-listar-sedes',
  imports: [CommonModule, RouterModule, AlertConfirmComponent],
  templateUrl: './listar-sedes.component.html',
  styleUrls: ['./listar-sedes.component.css']
})
export class ListarSedesComponent implements OnInit {
  sedes: Sede[] = [];
  showConfirm = false;
  sedeAEliminar: Sede | null = null;
  alertTheme: 'light' | 'dark' = 'light';
  private temaSub!: Subscription;

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
    private sanitizer: DomSanitizer,
    private router: Router,
    private temaService: TemaService
  ) {}

  ngOnInit(): void {
    this.cargarSedes();
    this.temaSub = this.temaService.modoOscuro$.subscribe(modoOscuro => {
      this.alertTheme = modoOscuro ? 'dark' : 'light';
    });
  }

  ngOnDestroy(): void {
    if (this.temaSub) this.temaSub.unsubscribe();
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
    const url = `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  editarSede(sede: Sede) {
    if (sede.id_sede !== undefined) {
      this.router.navigate(['/admin/edit-sede', sede.id_sede]);
    }
  }

  eliminarSede(sede: Sede) {
    this.sedeAEliminar = sede;
    this.showConfirm = true;
  }

  confirmarEliminar() {
    if (!this.sedeAEliminar?.id_sede) return;
    this.sedeService.eliminarSede(this.sedeAEliminar.id_sede).subscribe({
      next: () => {
        this.sedes = this.sedes.filter(s => s.id_sede !== this.sedeAEliminar?.id_sede);
        this.showConfirm = false;
        this.sedeAEliminar = null;
      },
      error: (err) => {
        alert('No se pudo eliminar la sede: ' + (err.error?.mensaje || 'Error desconocido'));
        this.showConfirm = false;
        this.sedeAEliminar = null;
      }
    });
  }

  cancelarEliminar() {
    this.showConfirm = false;
    this.sedeAEliminar = null;
  }
}