import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-exportar',
  templateUrl: './exportar.component.html',
  styleUrls: ['./exportar.component.css'],
  imports: [CommonModule, FormsModule]
})
export class ExportarComponent {
  searchQuery: string = '';
  activeMenu: string | null = null;
  activeSubMenu: string | null = null;
  filteredRows: Array<{ category: string }> = [
    { category: 'Películas' },
    { category: 'Actores' },
    { category: 'Sedes' }
  ];

  constructor(private exportService: ExportService) {}

  exportPDF(): void {
    this.exportService.exportPDF();
  }

  exportExcel(): void {
    this.exportService.exportExcel();
  }

  filterRows(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (query) {
      this.filteredRows = this.filteredRows.filter(row =>
        row.category.toLowerCase().includes(query)
      );
    } else {
      this.filteredRows = [
        { category: 'Películas' },
        { category: 'Actores' },
        { category: 'Sedes' }
      ];
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredRows = [
      { category: 'Películas' },
      { category: 'Actores' },
      { category: 'Sedes' }
    ];
  }

  showMenu(category: string): void {
    this.activeMenu = category;
  }

  hideMenu(category: string): void {
    if (this.activeMenu === category) {
      this.activeMenu = null;
    }
  }

  showSubMenu(subMenu: string): void {
    this.activeSubMenu = subMenu;
  }

  hideSubMenu(subMenu: string): void {
    if (this.activeSubMenu === subMenu) {
      this.activeSubMenu = null;
    }
  }
}
