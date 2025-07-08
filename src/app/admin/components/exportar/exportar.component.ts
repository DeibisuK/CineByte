import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExportService } from '../../../services/export.service';

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

  constructor(private exportService: ExportService) {}

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
    
    // Close menu after download
    this.activeMenu = null;
    
    try {
      // Call the export service with the appropriate parameters
      // Using 'any' to bypass TypeScript checking temporarily
      const service = this.exportService as any;
      
      if (service.exportFile && typeof service.exportFile === 'function') {
        service.exportFile(category, option, format);
      } else {
        // Fallback to original methods
        if (format === 'pdf') {
          this.exportService.exportPDF();
        } else {
          this.exportService.exportExcel();
        }
      }
      
      // Show success message
      const message = `✅ Generando ${option} de ${category} en formato ${format.toUpperCase()}`;
      console.log(message);
      
    } catch (error) {
      console.error('Error al generar el archivo:', error);
      alert(`❌ Error al generar el archivo de ${option} de ${category}`);
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredCategories = [...this.allCategories];
    this.activeMenu = null;
  }
}
