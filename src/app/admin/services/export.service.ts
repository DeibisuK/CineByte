import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() {}

  exportPDF(): void {
    const doc = new jsPDF();

    // Personalización del PDF
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text('Reporte Personalizado', 10, 10);

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Este es un ejemplo de PDF personalizado.', 10, 20);

    // Guardar el archivo
    doc.save('reporte.pdf');
  }

  exportExcel(): void {
    const data = [
      { Nombre: 'Juan', Edad: 30, Ciudad: 'Madrid' },
      { Nombre: 'Ana', Edad: 25, Ciudad: 'Barcelona' },
      { Nombre: 'Luis', Edad: 35, Ciudad: 'Valencia' }
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

    // Guardar el archivo
    XLSX.writeFile(workbook, 'reporte.xlsx');
  }
}
