import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SimulationViewComponent } from '../simulation-view/simulation-view.component';
import { PeliculaService } from '@features/movies/services/pelicula.service';
import { SalasService, AsientosService } from '@features/venues';
import { Asiento as AsientoDB, Sala, Pelicula } from '@core/models';
import { VentasService, PagosService } from '@features/payments/services';
import Swal from 'sweetalert2';

interface AsientoLocal {
  id: string;
  fila: string;
  numero: number;
  estado: 'disponible' | 'ocupado' | 'seleccionado' | 'espacio';
  precio: number;
  id_asiento?: number;
  url_imagen?: string | null;
  tipo?: string;
}

interface CompraInfo {
  pelicula: number;
  titulo: string;
  idioma: string;
  horario: string;
  cantidad: number;
  precio: number;
  total: number;
  id_sala?: number;
}

@Component({
  selector: 'app-select-seat',
  imports: [CommonModule, SimulationViewComponent],
  templateUrl: './select-seat.component.html',
  styleUrl: './select-seat.component.css'
})
export class SelectSeatComponent implements OnInit {
  
  compraInfo: CompraInfo = {
    pelicula: 0,
    titulo: 'Título de Película',
    idioma: 'Español',
    horario: '19:00',
    cantidad: 2,
    precio: 15000,
    total: 30000,
    id_sala: 1
  };

  asientos: AsientoLocal[] = [];
  asientosSeleccionados: AsientoLocal[] = [];
  filas: string[] = [];
  asientosPorFila = 0;
  salaInfo: Sala | null = null;
  pelicula: Pelicula | null = null;
  loadingAsientos = false;

  // Validación de asientos
  maxAsientosDisponibles = 0;
  asientosDisponibles = 0;

  // Modal simulation-view
  showSimulationModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private peliculaService: PeliculaService,
    private salasService: SalasService,
    private asientosService: AsientosService,
    private ventasService: VentasService,
    private pagosService: PagosService
  ) {}

  ngOnInit(): void {
    // Intentar cargar datos desde sessionStorage primero
    this.loadDataFromStorage();
    
    // Obtener parámetros de la URL (pueden sobrescribir los datos del storage)
    this.route.queryParams.subscribe(params => {
      console.log('Parámetros recibidos:', params);
      
      if (params['titulo']) {
        this.compraInfo = {
          pelicula: +params['pelicula'] || 1,
          titulo: params['titulo'] || 'Título de Película',
          idioma: params['idioma'] || 'Español',
          horario: params['horario'] || '19:00',
          cantidad: +params['cantidad'] || 2,
          precio: +params['precio'] || 15000,
          total: +params['total'] || 30000,
          id_sala: +params['id_sala'] || 1
        };
        
        console.log('CompraInfo actualizada:', this.compraInfo);
        
        // Guardar en sessionStorage
        this.saveDataToStorage();
        
        // Cargar datos reales
        this.loadMovieAndSeatData();
      }
    });

    // Si no hay parámetros pero hay datos en storage, cargar datos
    if (!this.route.snapshot.queryParams['titulo'] && this.compraInfo.pelicula) {
      this.loadMovieAndSeatData();
    }
  }

  private loadMovieAndSeatData(): void {
    // Cargar datos de la película
    this.peliculaService.getPeliculaById(this.compraInfo.pelicula).subscribe({
      next: (pelicula) => {
        this.pelicula = pelicula;
      },
      error: (error) => {
        console.error('Error loading movie data:', error);
      }
    });

    // Cargar datos de la sala y asientos
    this.loadSalaData();
  }

  private loadSalaData(): void {
    if (!this.compraInfo.id_sala) {
      console.error('No sala ID provided, using fallback');
      this.generarAsientosFallback();
      return;
    }

    console.log('Loading sala data for ID:', this.compraInfo.id_sala);
    this.loadingAsientos = true;

    // Cargar información de la sala
    this.salasService.getSalaById(this.compraInfo.id_sala).subscribe({
      next: (sala) => {
        console.log('Sala data loaded:', sala);
        this.salaInfo = sala;
        // Cargar asientos de la sala
        this.loadAsientos();
      },
      error: (error) => {
        console.error('Error loading sala data:', error);
        console.error('Tried to load sala ID:', this.compraInfo.id_sala);
        this.loadingAsientos = false;
        // Usar fallback con mensaje descriptivo
        this.generarAsientosFallback();
      }
    });
  }

  private loadAsientos(): void {
    if (!this.compraInfo.id_sala) return;

    this.salasService.getAsientosPorSala(this.compraInfo.id_sala).subscribe({
      next: (asientosDB: AsientoDB[]) => {
        this.convertirAsientosParaVista(asientosDB);
        this.loadingAsientos = false;
      },
      error: (error) => {
        console.error('Error loading asientos:', error);
        this.loadingAsientos = false;
        // Fallback a generación de asientos (para desarrollo)
        this.generarAsientosFallback();
      }
    });
  }

  private convertirAsientosParaVista(asientosDB: AsientoDB[]): void {
    this.asientos = [];
    const filasUnicas = new Set<string>();
    let asientosDisponiblesCount = 0;

    asientosDB.forEach(asientoDB => {
      filasUnicas.add(asientoDB.fila);
      
      let estado: 'disponible' | 'ocupado' | 'seleccionado' | 'espacio';
      
      // Determinar estado basado en tipo y ocupación
      if (asientoDB.tipo === 'espacio') {
        estado = 'espacio';
      } else if (asientoDB.ocupado) {
        estado = 'ocupado';
      } else {
        estado = 'disponible';
        asientosDisponiblesCount++; // Contar asientos disponibles
      }
      
      const asientoLocal: AsientoLocal = {
        id: `${asientoDB.fila}${asientoDB.columna}`,
        fila: asientoDB.fila,
        numero: asientoDB.columna,
        estado: estado,
        precio: this.compraInfo.precio,
        id_asiento: asientoDB.id_asiento,
        url_imagen: asientoDB.url_imagen,
        tipo: asientoDB.tipo
      };

      this.asientos.push(asientoLocal);
    });

    // Actualizar contadores de asientos disponibles
    this.asientosDisponibles = asientosDisponiblesCount;
    this.maxAsientosDisponibles = asientosDisponiblesCount;
    
    console.log(`Asientos disponibles en la sala: ${this.asientosDisponibles}`);

    // Ordenar filas alfabéticamente
    this.filas = Array.from(filasUnicas).sort();
    
    // Calcular asientos por fila (promedio)
    this.asientosPorFila = Math.ceil(asientosDB.length / this.filas.length);
  }

  private generarAsientosFallback(): void {
    // Método fallback para desarrollo - usar sala 3 que sabemos que existe
    console.log('Using fallback with real sala data (ID: 3)');
    
    // Intentar cargar sala 3 como fallback
    this.salasService.getSalaById(3).subscribe({
      next: (sala) => {
        console.log('Fallback sala loaded:', sala);
        this.salaInfo = sala;
        this.compraInfo.id_sala = 3; // Actualizar el ID de sala
        this.saveDataToStorage(); // Guardar la corrección
        
        // Cargar asientos de la sala 3
        this.salasService.getAsientosPorSala(3).subscribe({
          next: (asientosDB: AsientoDB[]) => {
            this.convertirAsientosParaVista(asientosDB);
            this.loadingAsientos = false;
          },
          error: (error) => {
            console.error('Error loading fallback seats:', error);
            this.generarAsientosEstaticos();
          }
        });
      },
      error: (error) => {
        console.error('Error loading fallback sala:', error);
        this.generarAsientosEstaticos();
      }
    });
  }

  private generarAsientosEstaticos(): void {
    // Último recurso: generar asientos estáticos
    console.log('Using static seat generation as last resort');
    this.asientos = [];
    this.filas = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    this.asientosPorFila = 7;
    this.loadingAsientos = false;
    
    let asientosDisponiblesCount = 0;
    
    this.filas.forEach(fila => {
      for (let i = 1; i <= this.asientosPorFila; i++) {
        const ocupadoProbabilidad = Math.random() < 0.3;
        const estado = ocupadoProbabilidad ? 'ocupado' : 'disponible';
        
        if (estado === 'disponible') {
          asientosDisponiblesCount++;
        }
        
        this.asientos.push({
          id: `${fila}${i}`,
          fila: fila,
          numero: i,
          estado: estado,
          precio: this.compraInfo.precio
        });
      }
    });

    // Actualizar contadores
    this.asientosDisponibles = asientosDisponiblesCount;
    this.maxAsientosDisponibles = asientosDisponiblesCount;
    
    console.log(`Asientos disponibles (estáticos): ${this.asientosDisponibles}`);
  }

  private loadDataFromStorage(): void {
    const savedData = sessionStorage.getItem('select-seat-data');
    if (savedData) {
      try {
        this.compraInfo = JSON.parse(savedData);
      } catch (error) {
        console.error('Error loading data from storage:', error);
      }
    }
  }

  private saveDataToStorage(): void {
    try {
      sessionStorage.setItem('select-seat-data', JSON.stringify(this.compraInfo));
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  }

  // Cerrar modal de simulación
  closeSimulationModal(): void {
    this.showSimulationModal = false;
  }

  // Calcular subtotal de asientos seleccionados
  private calcularSubtotal(): number {
    return this.asientosSeleccionados.reduce((sum, asiento) => sum + asiento.precio, 0);
  }

  // Calcular total con IVA
  private calcularTotal(): number {
    const subtotal = this.calcularSubtotal();
    const iva = subtotal * 0.19;
    return subtotal + iva;
  }

  // Obtener resumen para el modal de simulación
  get selectedSeatsForModal() {
    return this.asientosSeleccionados.map(asiento => ({
      row: asiento.fila,
      number: asiento.numero,
      price: asiento.precio,
      image: asiento.url_imagen
    }));
  }

  async comprar(): Promise<void> {
    if (!this.puedeSeleccionar) {
      await Swal.fire({
        icon: 'warning',
        title: 'Selección incompleta',
        text: this.mensajeValidacion,
        confirmButtonColor: '#007bff'
      });
      return;
    }

    // Mostrar loader mientras se procesa la selección
    Swal.fire({
      title: 'Procesando selección...',
      text: 'Preparando tu compra',
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Simular un pequeño delay para mostrar el loader
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // 1. Verificar disponibilidad de asientos antes de proceder
      const numerosAsientos = this.asientosSeleccionados.map(a => a.id);
      const disponibilidad = await this.ventasService.verificarDisponibilidadAsientos(
        this.compraInfo.pelicula, // Usar id de película como función por ahora
        numerosAsientos
      ).toPromise();

      if (!disponibilidad?.disponibles) {
        // Cerrar el loader antes de mostrar el error
        Swal.close();
        
        await Swal.fire({
          icon: 'error',
          title: 'Asientos no disponibles',
          text: `Los siguientes asientos ya no están disponibles: ${disponibilidad?.asientos_ocupados.join(', ')}`,
          confirmButtonColor: '#007bff'
        });
        
        // Recargar asientos para mostrar estado actual
        this.loadAsientos();
        return;
      }

      // 2. Navegar directamente a detail-payment con los datos de la compra
      const parametrosPago = {
        pelicula: this.compraInfo.pelicula,
        titulo: this.compraInfo.titulo,
        idioma: this.compraInfo.idioma,
        horario: this.compraInfo.horario,
        cantidad: this.asientosSeleccionados.length,
        precio: this.asientosSeleccionados[0]?.precio || this.compraInfo.precio,
        total: this.calcularTotal(),
        portada: this.pelicula?.imagen,
        sala: this.salaInfo?.nombre,
        asientosSeleccionados: numerosAsientos.join(','),
        id_sala: this.compraInfo.id_sala
      };

      // Cerrar el loader antes de navegar
      Swal.close();

      await this.router.navigate(['/detail-payment'], { 
        queryParams: parametrosPago 
      });

    } catch (error: any) {
      console.error('Error al procesar compra:', error);
      
      // Cerrar el loader antes de mostrar el error
      Swal.close();
      
      await Swal.fire({
        icon: 'error',
        title: 'Error en la compra',
        text: error.message || 'Ocurrió un error al procesar la compra. Inténtalo nuevamente.',
        confirmButtonColor: '#007bff'
      });
    }
  }

  volverAtras(): void {
    // Guardar estado actual en sessionStorage antes de salir
    this.saveDataToStorage();
    
    // Volver al detalle de la película o cartelera según el contexto
    if (this.compraInfo.pelicula && this.compraInfo.titulo) {
      this.router.navigate(['/pelicula', this.compraInfo.pelicula, this.compraInfo.titulo]);
    } else {
      this.router.navigate(['/cartelera']); // Usar cartelera en lugar de shop
    }
  }

  getAsientosPorFila(fila: string): AsientoLocal[] {
    return this.asientos.filter(asiento => asiento.fila === fila);
  }

  seleccionarAsiento(asiento: AsientoLocal): void {
    console.log('Intentando seleccionar asiento:', asiento);
    
    if (asiento.estado === 'ocupado' || asiento.estado === 'espacio') {
      console.log('Asiento no seleccionable:', asiento.estado);
      return;
    }

    if (asiento.estado === 'seleccionado') {
      // Deseleccionar asiento
      asiento.estado = 'disponible';
      this.asientosSeleccionados = this.asientosSeleccionados.filter(a => a.id !== asiento.id);
      console.log('Asiento deseleccionado. Total seleccionados:', this.asientosSeleccionados.length);
    } else {
      // Verificar límites antes de seleccionar
      const maxPermitido = this.getMaxAsientosPermitidos();
      
      if (this.asientosSeleccionados.length < maxPermitido) {
        // Seleccionar asiento
        asiento.estado = 'seleccionado';
        this.asientosSeleccionados.push(asiento);
        console.log('Asiento seleccionado. Total seleccionados:', this.asientosSeleccionados.length);
      } else {
        console.log(`Límite alcanzado. Máximo permitido: ${maxPermitido}`);
      }
    }
  }

  // Métodos de validación de asientos
  getMaxAsientosPermitidos(): number {
    // El máximo de asientos que se pueden seleccionar es el menor entre:
    // 1. La cantidad solicitada originalmente (compraInfo.cantidad)
    // 2. Los asientos realmente disponibles en la sala
    return Math.min(this.compraInfo.cantidad, this.asientosDisponibles);
  }

  get puedeVerVista(): boolean {
    return this.asientosSeleccionados.length > 0;
  }

  get puedeSeleccionar(): boolean {
    const maxPermitido = this.getMaxAsientosPermitidos();
    return this.asientosSeleccionados.length === maxPermitido;
  }

  get mensajeValidacion(): string {
    const seleccionados = this.asientosSeleccionados.length;
    const maxPermitido = this.getMaxAsientosPermitidos();
    const solicitados = this.compraInfo.cantidad;
    
    if (seleccionados === 0) {
      if (maxPermitido < solicitados) {
        return `Solo hay ${maxPermitido} asiento${maxPermitido > 1 ? 's' : ''} disponible${maxPermitido > 1 ? 's' : ''} (solicitaste ${solicitados})`;
      }
      return `Selecciona ${maxPermitido} asiento${maxPermitido > 1 ? 's' : ''}`;
    } else if (seleccionados < maxPermitido) {
      const faltantes = maxPermitido - seleccionados;
      return `Selecciona ${faltantes} asiento${faltantes > 1 ? 's' : ''} más`;
    } else if (seleccionados === maxPermitido && maxPermitido < solicitados) {
      return `Máximo disponible alcanzado (${maxPermitido}/${solicitados})`;
    }
    return '';
  }

  simularVista(): void {
    if (!this.puedeVerVista) return;
    
    // Abrir modal de simulación
    this.showSimulationModal = true;
  }
}
