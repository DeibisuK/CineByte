import { Component, OnInit } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ExportarComponent } from '../exportar/exportar.component';
import { FuncionesService, PeliculaService } from '@features/movies';
import { VentasService } from '@features/payments/services';
import { forkJoin, map } from 'rxjs';
import { AsientosService, SalasService, SedeSalasService } from '@features/venues';
import { AuthService } from '@core/services';
import { UserManagementService } from '@core/services/user-management.service';

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

interface DashboardData {
  ingresosTotales: number;
  boletosVendidos: number;
  estadisticasGenerales: {
    total_funciones: number;
    capacidad_total: number;
  };
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, ExportarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  Meses: { mes: string; numero: number }[] = [
    { mes: 'Enero', numero: 1 },
    { mes: 'Febrero', numero: 2 },
    { mes: 'Marzo', numero: 3 },
    { mes: 'Abril', numero: 4 },
    { mes: 'Mayo', numero: 5 },
    { mes: 'Junio', numero: 6 },
    { mes: 'Julio', numero: 7 },
    { mes: 'Agosto', numero: 8 },
    { mes: 'Septiembre', numero: 9 },
    { mes: 'Octubre', numero: 10 },
    { mes: 'Noviembre', numero: 11 },
    { mes: 'Diciembre', numero: 12 }
  ];
  anos: number[] = [];
  selectedYear: number = 0;
  selectedMonth: number = 0;
  showExportModal: boolean = false;
  currentDateTime: string = new Date().toLocaleString();
  isLoading: boolean = true;
  dashboardCards: DashboardCard[] = [];
  dashboardData: DashboardData = {
    ingresosTotales: 0,
    boletosVendidos: 0,
    estadisticasGenerales: {
      total_funciones: 0,
      capacidad_total: 0
    }
  };
  weeklyData: ChartData[] = [];
  topMovies: { title: string, sales: number, percentage: number }[] = [];
  recentTransactions: { id: number, amount: number, movie: string, status: string, time: string }[] = [];

  userTotal: number = 0;
  totalCartelera: number = 0;
  totalSalasActivas: number = 0;
  totalFuncionesActivas: number = 0;

  constructor(private http: HttpClient, private peliService: PeliculaService,
    private ventasService: VentasService, private asientosService: AsientosService,
    private funcionesService: FuncionesService, private auth: AuthService, private salasService: SedeSalasService,
    private userManagementService: UserManagementService
  ) { }

  ngOnInit(): void {
    this.loadingAll();
    this.loadTopMovies(); // Agregar esta línea
  }

  getAnos(): Promise<void> {
    return new Promise((resolve) => {
      this.peliService.getAnioFromPeliculas().subscribe(
        (data: number[]) => {
          this.anos = data.sort((a, b) => a - b);
          resolve();
        }
      );
    });
  }

  loadingCards(): void {
    this.dashboardCards = [
      {
        title: 'Ingresos Totales',
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
        value: (this.dashboardData.estadisticasGenerales?.total_funciones || 0).toString(),
        icon: 'fas fa-film',
        trend: '0%',
        trendIcon: 'fas fa-arrow-up',
        color: 'warning'  // Amarillo
      },
      {
        title: 'Ocupación Promedio',
        value: `${Math.round((this.dashboardData.boletosVendidos || 0) / (this.dashboardData.estadisticasGenerales?.capacidad_total || 1) * 100)}%`,
        icon: 'fas fa-chart-pie',
        trend: '0%',
        trendIcon: 'fas fa-arrow-up',
        color: 'info'  // Celeste
      }
    ];
  }

  getDashboardData(): Promise<void> {
    const today = new Date();
    const endDate = today.toISOString().slice(0, 10); // 'YYYY-MM-DD'
    const startDate = new Date(today.setDate(today.getDate() - 6)).toISOString().slice(0, 10)

    return new Promise(async (resolve, reject) => {
      const user = await this.auth.getCurrentUID();
      if (!user) throw new Error('Usuario no autenticado');

      // Ejecutar ambas llamadas en paralelo y esperar a que ambas terminen
      forkJoin({
        ventas: this.ventasService.getVentasPorMesYAnio(this.selectedMonth, this.selectedYear),
        boletos: this.ventasService.getAllBoletosVendidos(this.selectedMonth, this.selectedYear),
        funcionesActivas: this.funcionesService.getFunciones(),
        todosLosAsientos: this.asientosService.getAsientos(),
        ventasPorDia: this.ventasService.getVentasPorDia(startDate, endDate),
        transaccionesRecientes: this.ventasService.getHistorialVentas(user, 5, 0),
        usuarios: this.userManagementService.obtenerUsuarios(),
        peliculasActivas: this.peliService.getPeliculas().pipe(
          map(peliculas => peliculas.filter(pelicula => pelicula.estado === 'activo'))
        ),
        salas: this.salasService.getSedesSalas().pipe(
          map(sedesSalas => sedesSalas.filter(sedeSala => sedeSala.estado === 'Disponible'))
        )

      }).subscribe({
        next: (results) => {
          this.dashboardData.ingresosTotales = results.ventas?.ventas?.obtener_ingresos_por_mes_y_anio;
          this.dashboardData.boletosVendidos = results.boletos?.boletosVendidos?.obtener_total_boletos_vendidos;
          this.dashboardData.estadisticasGenerales.total_funciones = results.funcionesActivas.filter(funcion => funcion.estado === 'activa').length;
          this.dashboardData.estadisticasGenerales.capacidad_total = results.todosLosAsientos.total

          const ventasRecientes = (results.ventasPorDia || []).slice(-7);
          this.weeklyData = ventasRecientes.map((venta: any, index: number) => ({
            label: venta.fecha ? this.getDayName(venta.fecha) : `Día ${index + 1}`,
            value: venta.total_ventas || 0,
            color: '#ffd700'
          }));

          // Procesar transacciones recientes
          this.recentTransactions = (results.transaccionesRecientes || []).map((venta: any) => ({
            id: venta.id_venta,
            movie: venta.pelicula_titulo || 'Película desconocida',
            amount: venta.total || 0,
            time: new Date(venta.fecha_funcion).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            status: venta.estado // 1 para confirmada, 0 para pendiente
          }));

          // Actualizar estadísticas adicionales
          this.userTotal = results.usuarios.length;
          this.totalCartelera = results.peliculasActivas.length;
          this.totalSalasActivas = results.salas.length;
          this.totalFuncionesActivas = results.funcionesActivas.length;
          resolve();
        },
        error: (error) => {
          console.error('Error al obtener datos del dashboard:', error);
          reject(error);
        }
      });
    });
  }

  loadTopMovies(): void {
    // Aquí necesitarías llamar a un servicio que te dé las ventas por película
    this.peliService.getPeliculasMasVendidas().subscribe({
      next: (ventas) => {
        // Procesar los datos para calcular porcentajes
        const totalVentas = ventas.reduce((sum, venta) => sum + venta.total_vendidos, 0);

        this.topMovies = ventas.slice(0, 5).map(venta => ({
          title: venta.titulo_pelicula,
          sales: venta.total_vendidos,
          percentage: Math.round((venta.total_vendidos / totalVentas) * 100)
        }));
      },
      error: (error) => {
        console.error('Error al cargar películas más vendidas:', error);
      }
    });
  }

  async loadingAll(): Promise<void> {
    try {
      // 1. Primero obtener años y establecer valores por defecto
      await this.getAnos();
      this.selectedYear = this.anos[0];

      this.Meses.forEach(mes => {
        if (mes.numero === new Date().getMonth() + 1) {
          this.selectedMonth = mes.numero;
        }
      });

      // 2. Después obtener datos del dashboard con los valores correctos
      await this.getDashboardData();

      // 3. Finalmente actualizar UI
      this.isLoading = false;
      this.loadingCards();

    } catch (error) {
      console.error('Error en loadingAll:', error);
      this.isLoading = false;
    }
  }

  applyFilters(): void {
    this.getDashboardData().then(() => {
      this.loadingCards();
    });
  }

  openExportModal(): void {
    this.showExportModal = true;
  }

  closeExportModal(): void {
    this.showExportModal = false;
  }

  getBarHeight(data: number): string {
    const totalValue = this.weeklyData.reduce((sum, d) => sum + d.value, 0);
    return `${(data / totalValue) * 100}px`;
  }

  getPercentage(data: number): string {
    const totalValue = this.weeklyData.reduce((sum, d) => sum + d.value, 0);
    const percentage = totalValue > 0 ? (data / totalValue) * 100 : 0;
    return `${Math.round(percentage)}%`;
  }

  getDayName(fechaISO: string): string {
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const fecha = new Date(fechaISO);
    return diasSemana[fecha.getDay()];
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmada': return 'status-completed';
      case 'pendiente': return 'status-pending';
      case 'fallida': return 'status-failed';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'confirmada': return 'Confirmada';
      case 'pendiente': return 'Pendiente';
      case 'fallida': return 'Fallida';
      default: return status;
    }
  }
}
