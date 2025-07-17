import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

interface ExportRequest {
  category: string;
  reportType: string;
  format: 'pdf' | 'excel';
}

interface ExportResponse {
  data: Blob;
  filename: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExportarService {
  //private apiURL = 'https://api-cinebyte-akvqp.ondigitalocean.app/api';
  private apiURL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  /**
   * Exporta datos según la categoría, tipo de reporte y formato especificados
   */
  exportFile(category: string, reportType: string, format: 'pdf' | 'excel'): void {
    const exportRequest: ExportRequest = {
      category,
      reportType,
      format
    };

    // Configurar headers para recibir blob
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Realizar petición con responseType 'blob'
    this.http.post(`${this.apiURL}/export/`, exportRequest, {
      headers,
      responseType: 'blob',
      observe: 'response'
    }).subscribe({
      next: (response) => {
        // Extraer el nombre del archivo del header Content-Disposition si está disponible
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `${category}_${reportType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
        
        if (contentDisposition) {
          const matches = contentDisposition.match(/filename="(.+)"/);
          if (matches && matches[1]) {
            filename = matches[1];
          }
        } else {
          // Agregar extensión si no está en el nombre
          filename += format === 'pdf' ? '.pdf' : '.xlsx';
        }

        // Descargar el archivo usando URL.createObjectURL
        if (response.body) {
          const blob = response.body;
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          this.showSuccessMessage(category, reportType, format);
        }
      },
      error: (error) => {
        console.error('Error al exportar archivo:', error);
        this.showErrorMessage(category, reportType, format, error);
      }
    });
  }

  /**
   * Obtiene la lista de reportes disponibles
   */
  getAvailableReports(): Observable<any> {
    return this.http.get(`${this.apiURL}/reports`);
  }

  /**
   * Método legacy para PDF (mantenido para compatibilidad)
   */
  exportPDF(): void {
    console.warn('Método exportPDF() está deprecado. Use exportFile() en su lugar.');
    this.exportFile('General', 'Listado completo', 'pdf');
  }

  /**
   * Método legacy para Excel (mantenido para compatibilidad)
   */
  exportExcel(): void {
    console.warn('Método exportExcel() está deprecado. Use exportFile() en su lugar.');
    this.exportFile('General', 'Listado completo', 'excel');
  }

  /**
   * Exporta múltiples reportes en batch
   */
  exportBatch(exports: ExportRequest[]): void {
    exports.forEach((exportReq, index) => {
      // Agregar delay entre exportaciones para no sobrecargar el servidor
      setTimeout(() => {
        this.exportFile(exportReq.category, exportReq.reportType, exportReq.format);
      }, index * 1000); // 1 segundo de delay entre cada exportación
    });
  }

  /**
   * Valida si una combinación de categoría y reporte es válida
   */
  isValidExport(category: string, reportType: string): boolean {
    const validCombinations: { [key: string]: string[] } = {
      'Peliculas': [
        'Películas más vendidas',
        'Listado completo',
        'Por género'
      ],
      'Actores': [
        'Actores que han participado en mas películas',
        'Listado completo'
      ],
      'Generos': [
        'Generos más populares en ventas',
        'Generos con más películas publicadas',
        'Listado completo'
      ],
      'Distribuidores': [
        'Distribuidores que han publicado más películas',
        'Distribuidores con más películas exitosas',
        'Distribuidores con más películas fracasadas',
        'Listado completo'
      ],
      'Funciones': [
        'Funciones con mayor asistencia',
        'Funciones por horario más populares',
        'Funciones más vendidas en los ultimos 30 días',
        'Funciones por tipo',
        'Listado completo'
      ],
      'Salas': [
        'Salas disponibles',
        'Ocupación por sala',
        'Listado completo'
      ],
      'Sedes': [
        'Sedes principales',
        'Listado completo'
      ],
      'Usuarios': [
        'Usuarios con más compras',
        'Listado completo'
      ]
    };

    return validCombinations[category]?.includes(reportType) || false;
  }

  /**
   * Muestra mensaje de éxito con SweetAlert2
   */
  private showSuccessMessage(category: string, reportType: string, format: string): void {
    // Cerrar cualquier SweetAlert2 abierto
    Swal.close();
    
    Swal.fire({
      title: 'Descarga exitosa',
      html: `
        <div style="text-align: left; margin: 15px 0;">
          <p><strong>Archivo:</strong> ${reportType}</p>
          <p><strong>Categoría:</strong> ${category}</p>
          <p><strong>Formato:</strong> ${format.toUpperCase()}</p>
        </div>
        <p style="color: #22C55E; font-weight: 600;">¡El archivo se ha descargado correctamente!</p>
      `,
      icon: 'success',
      timer: 4000,
      timerProgressBar: true,
      showConfirmButton: false,
      customClass: {
        popup: 'cinebyte-swal-popup',
        title: 'cinebyte-swal-title'
      },
      background: '#FFFFFF',
      color: '#2D3748'
    });
  }

  /**
   * Muestra mensaje de error con SweetAlert2
   */
  private showErrorMessage(category: string, reportType: string, format: string, error: any): void {
    // Cerrar cualquier SweetAlert2 abierto
    Swal.close();
    
    let errorMessage = 'Error al descargar el archivo';
    let detailMessage = '';
    
    if (error.status === 404) {
      errorMessage = 'Reporte no encontrado';
      detailMessage = 'El tipo de reporte solicitado no está disponible.';
    } else if (error.status === 500) {
      errorMessage = 'Error interno del servidor';
      detailMessage = 'Hubo un problema al generar el archivo. Intenta nuevamente.';
    } else if (error.status === 0) {
      errorMessage = 'Error de conexión';
      detailMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    } else {
      detailMessage = 'Intenta nuevamente en unos momentos.';
    }

    console.error('Detalles del error:', error);
    
    Swal.fire({
      title: `❌ ${errorMessage}`,
      html: `
        <div style="text-align: left; margin: 15px 0;">
          <p><strong>Archivo solicitado:</strong> ${reportType}</p>
          <p><strong>Categoría:</strong> ${category}</p>
          <p><strong>Formato:</strong> ${format.toUpperCase()}</p>
        </div>
        <hr style="border: 1px solid #E5E7EB; margin: 15px 0;">
        <p style="color: #6B7280;">${detailMessage}</p>
      `,
      icon: 'error',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#FFA726',
      customClass: {
        popup: 'cinebyte-swal-popup',
        title: 'cinebyte-swal-title',
        confirmButton: 'cinebyte-swal-confirm'
      },
      background: '#FFFFFF',
      color: '#2D3748'
    });
  }
}
