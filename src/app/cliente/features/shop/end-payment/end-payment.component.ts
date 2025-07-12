import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Auth, User } from '@angular/fire/auth';
import { AuthService } from '@core/services';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-end-payment',
  imports: [CommonModule],
  templateUrl: './end-payment.component.html',
  styleUrl: './end-payment.component.css'
})
export class EndPaymentComponent implements OnInit {
  
  compraInfo = {
    titulo: 'Spider-Man: No Way Home',
    numeroFactura: 'CINE-2025-001247',
    asientos: ['F5', 'F6'],
    horario: '10:30 AM',
    fecha: '11 de Julio, 2025',
    sala: '3',
    precio: '$45.50',
    ventaId: null,
    total: 0,
    estado: 'completado'
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private auth: Auth,
    private authService: AuthService
  ) { }

  currentUser: User | null = null;
  apiUrl = 'http://localhost:3000'; // Ajusta según tu configuración

  ngOnInit(): void {
    // Obtener usuario actual
    this.auth.onAuthStateChanged((user: any) => {
      this.currentUser = user;
    });

    // Obtener datos de la URL
    this.route.queryParams.subscribe(params => {
      if (params['ventaId']) {
        this.compraInfo.ventaId = params['ventaId'];
        this.compraInfo.numeroFactura = `CINE-2025-${params['ventaId'].toString().padStart(6, '0')}`;
        this.compraInfo.total = params['total'] || 0;
        this.compraInfo.estado = params['estado'] || 'completado';
        this.compraInfo.titulo = params['titulo'] || this.compraInfo.titulo;
        this.compraInfo.horario = params['horario'] || this.compraInfo.horario;
        this.compraInfo.sala = params['sala'] || this.compraInfo.sala;
        this.compraInfo.precio = `$${Number(this.compraInfo.total).toLocaleString()}`;
        
        if (params['asientos']) {
          try {
            this.compraInfo.asientos = JSON.parse(params['asientos']);
          } catch (e) {
            console.error('Error parsing asientos:', e);
          }
        }

        // Mostrar sweet alert de éxito
        this.mostrarExito();
      }
    });
  }

  async mostrarExito(): Promise<void> {
    await Swal.fire({
      icon: 'success',
      title: '¡Compra exitosa!',
      text: 'Tu compra ha sido procesada exitosamente. Recibirás un email de confirmación.',
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#28a745',
      allowOutsideClick: false
    });
  }

  finalizarCompra(): void {
    this.router.navigate(['/inicio']);
  }

  async imprimirDetalle(): Promise<void> {
    if (!this.compraInfo.ventaId || !this.currentUser?.uid) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se puede generar la factura. Datos de venta faltantes.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    try {
      // Mostrar loader
      Swal.fire({
        title: 'Generando factura...',
        text: 'Por favor espera mientras preparamos tu factura PDF',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Llamar al endpoint de factura PDF
      const response = await this.http.get(
        `${this.apiUrl}/api/export/factura/${this.compraInfo.ventaId}/${this.currentUser.uid}`,
        { 
          responseType: 'blob',
          observe: 'response'
        }
      ).toPromise();

      if (response && response.body) {
        // Obtener el nombre del archivo de la respuesta
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `Factura_${this.compraInfo.ventaId}_${new Date().toISOString().split('T')[0]}.pdf`;
        
        if (contentDisposition) {
          const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }

        // Crear blob y descargar
        const blob = new Blob([response.body], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        // Crear enlace de descarga
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        
        // Limpiar
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);

        // Cerrar loader y mostrar éxito
        Swal.fire({
          icon: 'success',
          title: '¡Factura generada!',
          text: 'Tu factura PDF ha sido descargada exitosamente.',
          confirmButtonText: 'Perfecto'
        });

      } else {
        throw new Error('Respuesta vacía del servidor');
      }

    } catch (error: any) {
      let errorMessage = 'Error al generar la factura PDF. Intenta nuevamente.';
      
      if (error?.status === 404) {
        errorMessage = 'No se encontró la venta solicitada.';
      } else if (error?.status === 500) {
        errorMessage = 'Error interno del servidor. Intenta más tarde.';
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      }

      Swal.fire({
        icon: 'error',
        title: 'Error al generar factura',
        text: errorMessage,
        confirmButtonText: 'Entendido'
      });
    }
  }

}
