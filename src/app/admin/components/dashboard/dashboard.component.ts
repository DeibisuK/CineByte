import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ExportarComponent } from '../exportar/exportar.component';

interface DashboardCard {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  trendIcon?: string;
  color: string;
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, HttpClientModule, ExportarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  // Filtros
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  
  months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  years = [2022, 2023, 2024, 2025, 2026];

  // Fecha actual para mostrar en el dashboard
  currentDateTime = new Date().toLocaleString('es-ES');

  // Modal de exportar
  showExportModal = false;

  // Variables para datos reales
  isLoading = true;
  dashboardData: any = null;

  // Datos del dashboard (se actualizarán con datos reales)
  dashboardCards: DashboardCard[] = [];

  // Datos para gráficos (se actualizarán con datos reales)
  weeklyData: ChartData[] = [];

  topMovies: any[] = [];

  recentTransactions: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  applyFilters() {
    console.log(`Aplicando filtros: ${this.selectedMonth}/${this.selectedYear}`);
    this.loadDashboardData();
  }

  private async loadDashboardData() {
    try {
      this.isLoading = true;
      const url = `http://localhost:3000/api/dashboard/stats?mes=${this.selectedMonth}&ano=${this.selectedYear}`;
      
      console.log('🔄 Cargando datos del dashboard desde:', url);
      
      const response: any = await this.http.get(url).toPromise();
      
      console.log('📊 Respuesta completa del servidor:', response);
      
      // El servicio devuelve { success: true, data: {...} }
      this.dashboardData = response.data || response;
      
      console.log('📊 Datos procesados:', this.dashboardData);
      
      // Actualizar cards con datos reales manteniendo colores originales
      this.dashboardCards = [
        {
          title: 'Ventas Totales',
          value: `$${(this.dashboardData.ingresosTotales || 0).toLocaleString()}`,
          icon: 'fas fa-dollar-sign',
          trend: '+0%',
          trendIcon: 'fas fa-arrow-up',
          color: 'success'  // Verde siempre
        },
        {
          title: 'Boletos Vendidos',
          value: (this.dashboardData.boletosVendidos || 0).toLocaleString(),
          icon: 'fas fa-ticket-alt',
          trend: '+0%',
          trendIcon: 'fas fa-arrow-up',
          color: 'primary'  // Azul siempre
        },
        {
          title: 'Funciones Activas',
          value: (this.dashboardData.funcionesActivas || 0).toString(),
          icon: 'fas fa-film',
          trend: '0%',
          trendIcon: 'fas fa-arrow-up',
          color: 'warning'  // Amarillo
        },
        {
          title: 'Ocupación Promedio',
          value: `${this.dashboardData.ocupacionPromedio || 0}%`,
          icon: 'fas fa-chart-pie',
          trend: '0%',
          trendIcon: 'fas fa-arrow-up',
          color: 'info'  // Celeste
        }
      ];

      // Actualizar películas más populares
      this.topMovies = this.dashboardData.peliculasPopulares || [];
      console.log('🎬 Películas populares:', this.topMovies);

      // Actualizar transacciones recientes  
      this.recentTransactions = this.dashboardData.transaccionesRecientes || [];
      console.log('💳 Transacciones recientes:', this.recentTransactions);

      // Actualizar datos de gráfico semanal
      this.weeklyData = this.dashboardData.ventasSemana?.map((venta: any, index: number) => ({
        label: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][index] || `Día ${index + 1}`,
        value: venta.total_ventas || 0,
        color: '#ffd700'
      })) || [];
      console.log('📈 Datos semanales:', this.weeklyData);

    } catch (error) {
      console.error('❌ Error cargando datos del dashboard:', error);
      console.error('Detalles del error:', (error as any)?.error || (error as any)?.message || error);
      // Mantener datos por defecto si hay error
      this.loadDefaultData();
    } finally {
      this.isLoading = false;
    }
  }

  private loadDefaultData() {
    // Datos por defecto en caso de error
    this.dashboardCards = [
      {
        title: 'Ventas Totales',
        value: '$0',
        icon: 'fas fa-dollar-sign',
        trend: '+0%',
        trendIcon: 'fas fa-arrow-up',
        color: 'success'
      },
      {
        title: 'Boletos Vendidos',
        value: '0',
        icon: 'fas fa-ticket-alt',
        trend: '+0%',
        trendIcon: 'fas fa-arrow-up',
        color: 'primary'
      },
      {
        title: 'Funciones Activas',
        value: '0',
        icon: 'fas fa-film',
        trend: '0%',
        trendIcon: 'fas fa-arrow-down',
        color: 'warning'
      },
      {
        title: 'Ocupación Promedio',
        value: '0%',
        icon: 'fas fa-chart-pie',
        trend: '+0%',
        trendIcon: 'fas fa-arrow-up',
        color: 'info'
      }
    ];

    this.topMovies = [];
    this.recentTransactions = [];
    this.weeklyData = [];
  }

  getBarHeight(value: number): string {
    const maxValue = Math.max(...this.weeklyData.map(d => d.value));
    return `${(value / maxValue) * 100}%`;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      case 'failed': return 'Fallido';
      default: return status;
    }
  }

  // Métodos para el modal de exportar
  openExportModal(): void {
    this.showExportModal = true;
  }

  closeExportModal(): void {
    this.showExportModal = false;
  }
}
