import { Component, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExportarService } from '@core/services/utils/export.service';
import Swal from 'sweetalert2';


interface ExportCategory {
  id: string;
  title: string;
  sections: {
    name: string;
    options: string[];
  }[];
}

@Component({
  selector: 'app-exportar',
  templateUrl: './exportar.component.html',
  styleUrls: ['./exportar.component.css'],
  imports: [CommonModule, FormsModule]
})
export class ExportarComponent {
  @Input() showModal: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  searchQuery: string = '';
  activeMenu: string | null = null;
  
  allCategories: ExportCategory[] = [
    {
      id: 'Actores',
      title: 'Actores:',
      sections: [
        {
          name: 'Actores que han participado en mas películas',
          options: ['pdf', 'excel']
        },
        {
          name: 'Listado completo',
          options: ['pdf', 'excel']
        }
      ]
    },

    {
      id: 'Generos',
      title: 'Generos:',
      sections: [
        {
          name: 'Generos más populares en ventas',
          options: ['pdf', 'excel']
        },
        {
          name: 'Generos con más películas publicadas',
          options: ['pdf', 'excel']
        },
        {
          name: 'Listado completo',
          options: ['pdf', 'excel']
        }
      ]
    },

    {
      id: 'Distribuidores',
      title: 'Distribuidores:',
      sections: [
        {
          name: 'Distribuidores que han publicado más películas',
          options: ['pdf', 'excel']
        },
        {
          name: 'Distribuidores con más películas exitosas',
          options: ['pdf', 'excel']
        },
        {
          name: 'Distribuidores con más películas fracasadas',
          options: ['pdf', 'excel']
        },
        {
          name: 'Listado completo',
          options: ['pdf', 'excel']
        }
      ]
    },


    {
      id: 'Funciones',
      title: 'Funciones:',
      sections: [
        {
          name: 'Funciones con mayor asistencia',
          options: ['pdf', 'excel']
        },
        {
          name: 'Funciones por horario más populares',
          options: ['pdf', 'excel']
        },
        {
          name: 'Funciones más vendidas en los ultimos 30 días',
          options: ['pdf', 'excel']
        },
        {
          name: 'Funciones por tipo',
          options: ['pdf', 'excel']
        },
        {
          name: 'Listado completo',
          options: ['pdf', 'excel']
        }
      ]
    },

    {
      id: 'Películas',
      title: 'Películas:',
      sections: [
        {
          name: 'Películas más vendidas',
          options: ['pdf', 'excel']
        },
        {
          name: 'Listado completo',
          options: ['pdf', 'excel']
        },
        {
          name: 'Por género',
          options: ['pdf', 'excel']
        }
      ]
    },

    {
      id: 'Salas',
      title: 'Salas:',
      sections: [
        {
          name: 'Salas disponibles',
          options: ['pdf', 'excel']
        },
        {
          name: 'Ocupación por sala',
          options: ['pdf', 'excel']
        }
      ]
    },

    {
      id: 'Sedes',
      title: 'Sedes:',
      sections: [
        {
          name: 'Sedes principales',
          options: ['pdf', 'excel']
        },
        {
          name: 'Listado completo',
          options: ['pdf', 'excel']
        }
      ]
    },

    {
      id: 'Usuarios',
      title: 'Usuarios:',
      sections: [
        {
          name: 'Usuarios con más compras',
          options: ['pdf', 'excel']
        },
        {
          name: 'Listado completo',
          options: ['pdf', 'excel']
        }
      ]
    },
  ];

  filteredCategories: ExportCategory[] = [...this.allCategories];

  constructor(private exportService: ExportarService) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // Close menu if click is outside the export card
    if (!target.closest('.export-card')) {
      this.activeMenu = null;
    }
  }

  toggleMenu(category: string): void {
    this.activeMenu = this.activeMenu === category ? null : category;
  }

  filterRows(): void {
    const query = this.searchQuery.toLowerCase().trim();
    
    if (query === '') {
      // Si está vacío, mostrar todas las categorías
      this.filteredCategories = [...this.allCategories];
    } else {
      // Filtrar por título de categoría o por secciones
      this.filteredCategories = this.allCategories.filter(category => {
        const titleMatch = category.title.toLowerCase().includes(query);
        const sectionMatch = category.sections.some(section => 
          section.name.toLowerCase().includes(query)
        );
        return titleMatch || sectionMatch;
      });
    }
    
    // Cerrar menú activo si la categoría ya no está visible
    if (this.activeMenu && !this.filteredCategories.find(cat => cat.id === this.activeMenu)) {
      this.activeMenu = null;
    }
  }

  downloadFile(category: string, option: string, format: 'pdf' | 'excel'): void {
    console.log(`Downloading ${category} - ${option} as ${format}`);
    
    // Close menu after selection
    this.activeMenu = null;
    
    // Show SweetAlert2 confirmation with custom theme
    Swal.fire({
      title: 'Generar Reporte',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <p><strong>Categoría:</strong> ${category}</p>
          <p><strong>Tipo de reporte:</strong> ${option}</p>
          <p><strong>Formato:</strong> ${format.toUpperCase()}</p>
        </div>
        <p style="color: #666; font-size: 14px;">¿Deseas continuar con la generación?</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#FFA726', // Naranja del proyecto
      cancelButtonColor: '#6B7280',  // Gris
      confirmButtonText: `Generar ${format.toUpperCase()}`,
      cancelButtonText: 'Cancelar',
      backdrop: true,
      customClass: {
        popup: 'cinebyte-swal-popup',
        title: 'cinebyte-swal-title',
        htmlContainer: 'cinebyte-swal-content',
        confirmButton: 'cinebyte-swal-confirm',
        cancelButton: 'cinebyte-swal-cancel'
      },
      background: '#FFFFFF',
      color: '#2D3748'
    }).then((result) => {
      if (result.isConfirmed) {
        // Show loading alert
        Swal.fire({
          title: 'Generando reporte...',
          html: `
            <div style="text-align: center; margin: 20px 0;">
              <div class="loading-spinner" style="
                border: 4px solid #f3f3f3;
                border-top: 4px solid #FFA726;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 2s linear infinite;
                margin: 0 auto 15px;
              "></div>
              <p style="color: #666;">Preparando tu archivo ${format.toUpperCase()}...</p>
            </div>
            <style>
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          `,
          allowEscapeKey: false,
          allowOutsideClick: false,
          showConfirmButton: false,
          customClass: {
            popup: 'cinebyte-swal-popup'
          },
          background: '#FFFFFF',
          color: '#2D3748'
        });
        
        try {
          // Call the export service
          this.exportService.exportFile(category, option, format);
          
          // Success will be handled by the service, just close loading after delay
          setTimeout(() => {
            if (Swal.isVisible()) {
              Swal.close();
            }
          }, 2000);
          
        } catch (error) {
          console.error('Error al generar el archivo:', error);
          Swal.fire({
            title: '❌ Error',
            text: `No se pudo generar el archivo de ${option} de ${category}`,
            icon: 'error',
            confirmButtonColor: '#FFA726',
            customClass: {
              popup: 'cinebyte-swal-popup',
              confirmButton: 'cinebyte-swal-confirm'
            },
            background: '#FFFFFF',
            color: '#2D3748'
          });
        }
      }
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredCategories = [...this.allCategories];
    this.activeMenu = null;
  }

  onCloseModal(): void {
    this.closeModal.emit();
  }
}
