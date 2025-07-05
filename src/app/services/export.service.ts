import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

interface SedeData {
  id: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  email: string;
  capacidadTotal: number;
  numeroSalas: number;
  estado: string;
  fechaApertura: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() {}

  // Datos de ejemplo para sedes
  private sedesData: SedeData[] = [
    {
      id: 1,
      nombre: "CineByte Plaza Central",
      direccion: "Av. Principal 123",
      ciudad: "Santiago",
      telefono: "+56 2 2234 5678",
      email: "plazacentral@cinebyte.cl",
      capacidadTotal: 1250,
      numeroSalas: 8,
      estado: "Activa",
      fechaApertura: "2020-03-15"
    },
    {
      id: 2,
      nombre: "CineByte Mall Norte",
      direccion: "Mall Norte, Local 201",
      ciudad: "Santiago",
      telefono: "+56 2 2345 6789",
      email: "mallnorte@cinebyte.cl",
      capacidadTotal: 980,
      numeroSalas: 6,
      estado: "Activa",
      fechaApertura: "2019-11-22"
    },
    {
      id: 3,
      nombre: "CineByte Valparaíso",
      direccion: "Calle Errázuriz 456",
      ciudad: "Valparaíso",
      telefono: "+56 32 2456 7890",
      email: "valparaiso@cinebyte.cl",
      capacidadTotal: 750,
      numeroSalas: 5,
      estado: "Activa",
      fechaApertura: "2021-07-10"
    },
    {
      id: 4,
      nombre: "CineByte Concepción",
      direccion: "Plaza Independencia 789",
      ciudad: "Concepción",
      telefono: "+56 41 2567 8901",
      email: "concepcion@cinebyte.cl",
      capacidadTotal: 1100,
      numeroSalas: 7,
      estado: "Activa",
      fechaApertura: "2022-01-05"
    },
    {
      id: 5,
      nombre: "CineByte La Serena",
      direccion: "Av. Francisco de Aguirre 321",
      ciudad: "La Serena",
      telefono: "+56 51 2678 9012",
      email: "laserena@cinebyte.cl",
      capacidadTotal: 600,
      numeroSalas: 4,
      estado: "En Mantenimiento",
      fechaApertura: "2023-05-18"
    }
  ];

  exportFile(category: string, option: string, format: 'pdf' | 'excel'): void {
    if (format === 'pdf') {
      this.exportCustomPDF(category, option);
    } else {
      this.exportCustomExcel(category, option);
    }
  }

  private exportCustomPDF(category: string, option: string): void {
    const doc = new jsPDF();
    
    // Configuración de colores de CineByte
    const primaryColor = [247, 218, 0]; // Amarillo CineByte
    const darkColor = [40, 40, 40];
    const grayColor = [100, 100, 100];
    
    // Header con logo y título
    this.addPDFHeader(doc, primaryColor, darkColor);
    
    // Título del reporte
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(`${category} - ${option}`, 20, 60);
    
    // Fecha de generación
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    const today = new Date().toLocaleDateString('es-ES');
    doc.text(`Fecha de generación: ${today}`, 20, 70);
    
    // Contenido específico según la categoría y opción
    if (category === 'Sedes' && option === 'Listado completo') {
      this.addSedesListadoCompleto(doc, darkColor, grayColor);
    } else {
      // Contenido genérico para otras opciones
      this.addGenericContent(doc, category, option, darkColor, grayColor);
    }
    
    // Footer
    this.addPDFFooter(doc, grayColor);
    
    // Guardar archivo
    const fileName = `CineByte_${category}_${option.replace(/\s+/g, '_')}_${today.replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
  }

  private addPDFHeader(doc: jsPDF, primaryColor: number[], darkColor: number[]): void {
    // Fondo amarillo para el header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Título principal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('CINEBYTE', 20, 25);
    
    // Subtítulo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text('Sistema de Gestión Cinematográfica', 20, 35);
  }

  private addSedesListadoCompleto(doc: jsPDF, darkColor: number[], grayColor: number[]): void {
    let yPosition = 90;
    
    // Estadísticas generales
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('Resumen General', 20, yPosition);
    
    yPosition += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    
    const totalSedes = this.sedesData.length;
    const totalSalas = this.sedesData.reduce((sum, sede) => sum + sede.numeroSalas, 0);
    const totalCapacidad = this.sedesData.reduce((sum, sede) => sum + sede.capacidadTotal, 0);
    const sedesActivas = this.sedesData.filter(sede => sede.estado === 'Activa').length;
    
    doc.text(`• Total de sedes: ${totalSedes}`, 20, yPosition);
    doc.text(`• Sedes activas: ${sedesActivas}`, 20, yPosition + 10);
    doc.text(`• Total de salas: ${totalSalas}`, 20, yPosition + 20);
    doc.text(`• Capacidad total: ${totalCapacidad.toLocaleString()} espectadores`, 20, yPosition + 30);
    
    yPosition += 50;
    
    // Lista detallada de sedes
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('Listado Detallado de Sedes', 20, yPosition);
    
    yPosition += 20;
    
    this.sedesData.forEach((sede, index) => {
      // Verificar si necesitamos una nueva página
      if (yPosition > 250) {
        doc.addPage();
        this.addPDFHeader(doc, [247, 218, 0], darkColor);
        yPosition = 60;
      }
      
      // Información de cada sede
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text(`${index + 1}. ${sede.nombre}`, 20, yPosition);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      
      yPosition += 10;
      doc.text(`Dirección: ${sede.direccion}, ${sede.ciudad}`, 25, yPosition);
      yPosition += 8;
      doc.text(`Contacto: ${sede.telefono} | ${sede.email}`, 25, yPosition);
      yPosition += 8;
      doc.text(`Salas: ${sede.numeroSalas} | Capacidad: ${sede.capacidadTotal} espectadores`, 25, yPosition);
      yPosition += 8;
      doc.text(`Estado: ${sede.estado} | Apertura: ${sede.fechaApertura}`, 25, yPosition);
      
      yPosition += 15;
    });
  }

  private addGenericContent(doc: jsPDF, category: string, option: string, darkColor: number[], grayColor: number[]): void {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(grayColor[0]);
    
    doc.text(`Este es el reporte de ${option} para la categoría ${category}.`, 20, 90);
    doc.text('Contenido del reporte en desarrollo...', 20, 110);
    doc.text('Este PDF ha sido generado automáticamente por el sistema CineByte.', 20, 130);
  }

  private addPDFFooter(doc: jsPDF, grayColor: number[]): void {
    const pageHeight = doc.internal.pageSize.height;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(grayColor[0]);
    
    // Línea separadora
    doc.setDrawColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.line(20, pageHeight - 20, 190, pageHeight - 20);
    
    // Texto del footer
    doc.text('© 2025 CineByte - Sistema de Gestión Cinematográfica', 20, pageHeight - 10);
    doc.text(`Página 1 de 1`, 170, pageHeight - 10);
  }

  private exportCustomExcel(category: string, option: string): void {
    let data: any[] = [];
    let sheetName = 'Datos';
    
    if (category === 'Sedes' && option === 'Listado completo') {
      data = this.sedesData.map(sede => ({
        'ID': sede.id,
        'Nombre': sede.nombre,
        'Dirección': sede.direccion,
        'Ciudad': sede.ciudad,
        'Teléfono': sede.telefono,
        'Email': sede.email,
        'Número de Salas': sede.numeroSalas,
        'Capacidad Total': sede.capacidadTotal,
        'Estado': sede.estado,
        'Fecha de Apertura': sede.fechaApertura
      }));
      sheetName = 'Sedes_Listado_Completo';
    } else {
      // Datos genéricos para otras opciones
      data = [
        { 'Categoría': category, 'Opción': option, 'Estado': 'En desarrollo' }
      ];
      sheetName = `${category}_${option}`.replace(/\s+/g, '_');
    }
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Guardar archivo
    const today = new Date().toLocaleDateString('es-ES');
    const fileName = `CineByte_${category}_${option.replace(/\s+/g, '_')}_${today.replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  // Métodos originales para compatibilidad
  exportPDF(): void {
    this.exportCustomPDF('General', 'Reporte');
  }

  exportExcel(): void {
    this.exportCustomExcel('General', 'Reporte');
  }
}
