import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
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

  // Datos del dashboard
  dashboardCards: DashboardCard[] = [
    {
      title: 'Ventas Totales',
      value: '$45,280',
      icon: 'fas fa-dollar-sign',
      trend: '+12%',
      trendIcon: 'fas fa-arrow-up',
      color: 'success'
    },
    {
      title: 'Boletos Vendidos',
      value: '1,247',
      icon: 'fas fa-ticket-alt',
      trend: '+8%',
      trendIcon: 'fas fa-arrow-up',
      color: 'primary'
    },
    {
      title: 'Funciones Activas',
      value: '24',
      icon: 'fas fa-film',
      trend: '-2%',
      trendIcon: 'fas fa-arrow-down',
      color: 'warning'
    },
    {
      title: 'Ocupación Promedio',
      value: '78%',
      icon: 'fas fa-chart-pie',
      trend: '+5%',
      trendIcon: 'fas fa-arrow-up',
      color: 'info'
    }
  ];

  // Datos para gráficos
  weeklyData: ChartData[] = [
    { label: 'Lun', value: 85, color: '#ffd700' },
    { label: 'Mar', value: 92, color: '#ffd700' },
    { label: 'Mié', value: 78, color: '#ffd700' },
    { label: 'Jue', value: 95, color: '#ffd700' },
    { label: 'Vie', value: 100, color: '#ffd700' },
    { label: 'Sáb', value: 88, color: '#ffd700' },
    { label: 'Dom', value: 82, color: '#ffd700' }
  ];

  topMovies = [
    { title: 'Spider-Man: No Way Home', sales: '$8,542', percentage: 18.8 },
    { title: 'The Batman', sales: '$7,321', percentage: 16.1 },
    { title: 'Doctor Strange', sales: '$6,890', percentage: 15.2 },
    { title: 'Sonic 2', sales: '$5,430', percentage: 12.0 },
    { title: 'Morbius', sales: '$4,210', percentage: 9.3 }
  ];

  recentTransactions = [
    { id: '#12547', movie: 'Spider-Man: No Way Home', amount: '$45.50', time: '10:30 AM', status: 'completed' },
    { id: '#12546', movie: 'The Batman', amount: '$38.00', time: '10:15 AM', status: 'completed' },
    { id: '#12545', movie: 'Doctor Strange', amount: '$52.25', time: '10:05 AM', status: 'pending' },
    { id: '#12544', movie: 'Sonic 2', amount: '$29.75', time: '09:45 AM', status: 'completed' },
    { id: '#12543', movie: 'Morbius', amount: '$41.00', time: '09:30 AM', status: 'completed' }
  ];

  ngOnInit() {
    this.loadDashboardData();
  }

  applyFilters() {
    console.log(`Aplicando filtros: ${this.selectedMonth}/${this.selectedYear}`);
    // Aquí se implementará la lógica para filtrar los datos
    this.loadDashboardData();
  }

  private loadDashboardData() {
    // Simular carga de datos basada en los filtros
    // En una implementación real, aquí se harían las llamadas a la API
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
}
