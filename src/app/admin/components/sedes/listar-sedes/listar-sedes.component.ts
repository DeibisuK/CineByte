import { ChangeDetectorRef, Component, OnInit, SimpleChanges } from '@angular/core';
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

  constructor(
    private sedeService: SedeService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private temaService: TemaService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.cargarSedes();
    this.temaSub = this.temaService.modoOscuro$.subscribe(modoOscuro => {
      this.alertTheme = 'light'; // se cambia aquí primero
      setTimeout(() => {
        this.alertTheme = modoOscuro ? 'dark' : 'light'; // se reestablece
      }, 0);
    });
  }

  ngOnDestroy(): void {
    if (this.temaSub) this.temaSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['theme']) {
      // Forzar redibujado para que se apliquen las variables
      this.cdr.detectChanges();
    }
  }

  isClientRoute(): boolean {
    return this.router.url.includes('/donde-estamos');
  }

  cargarSedes() {
    this.sedeService.getSedes().subscribe(data => {
      this.sedes = data;
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