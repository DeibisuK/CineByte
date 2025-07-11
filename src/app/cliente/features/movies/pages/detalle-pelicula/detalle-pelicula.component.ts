import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarouselEstrenosComponent } from '../carousel-estrenos/carousel-estrenos.component';
import { Pelicula } from '@core/models/pelicula.model';
import { PeliculaService } from '@features/movies/services/pelicula.service';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { AuthService } from '@core/services/auth/auth.service';
import { FuncionesService } from '@features/movies/services/funciones.service';
import { SedeSalasService, SalasService } from '@features/venues';
import Swal from 'sweetalert2';


interface MediaItem {
  type: 'video' | 'image';
  url: string;
  thumbnail: string;
  title: string;
}

interface FuncionInfo {
  idioma: string;
  horarios: string[];
  trailer: string;
  precio: number;
}

@Component({
  selector: 'app-detalle-pelicula',
  imports: [CommonModule, CarouselEstrenosComponent, RouterModule],
  templateUrl: './detalle-pelicula.component.html',
  styleUrl: './detalle-pelicula.component.css'
})
export class DetallePeliculaComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  pelicula?: Pelicula;
  peliculaCompleta?: any; // Para datos expandidos con géneros, actores, etc.
  cantidad = 1;
  idiomaSeleccionado: string = '';
  horarioSeleccionado: string = '';
  safeTrailerUrl?: SafeResourceUrl;
  funcionesPorIdioma: FuncionInfo[] = [];
  funcionesCompletas: any[] = []; // Almacenar funciones completas para obtener id_sala

  // Estado de carga
  isLoading = true;

  // Estado de sede
  sedeSeleccionada: any = null; // Cambiar a objeto completo en lugar de string

  // Configuración del filtrado de funciones
  private readonly FILTRADO_ESTRICTO = false; // Permitir salas compartidas entre sedes

  // Propiedades para validación de asientos
  maxAsientosDisponibles: number = 0;
  asientosOcupados: number = 0;
  totalAsientos: number = 0;

  // Media carousel
  mediaItems: MediaItem[] = [];
  currentMediaIndex = 0;
  selectedMediaIndex = 0;
  originalItemsCount = 0; // Para manejar el carrusel infinito

  constructor(
    private route: ActivatedRoute,
    public sanitizer: DomSanitizer,
    private movieService: PeliculaService,
    private funcionesService: FuncionesService,
    private sedeSalasService: SedeSalasService,
    private salasService: SalasService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadMovieData(id);
    this.checkSedeSeleccionada();

    // Escuchar cambios de sede
    window.addEventListener('sedeSeleccionada', this.onSedeChanged.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Limpiar event listener
    window.removeEventListener('sedeSeleccionada', this.onSedeChanged.bind(this));
  }

  private onSedeChanged(event: any): void {
    this.checkSedeSeleccionada();

    // Si ahora hay sede seleccionada, cargar funciones
    if (this.sedeSeleccionada && this.pelicula) {
      this.loadFunciones(this.pelicula.id_pelicula);
    }
  }

  private loadMovieData(id: number): void {
    this.isLoading = true;
    
    // Usar forkJoin para cargar película básica y completa en paralelo
    const peliculaBasica$ = this.movieService.getPeliculaById(id);
    const peliculaCompleta$ = this.movieService.getPeliculaByIdComplete(id);

    forkJoin({
      basica: peliculaBasica$,
      completa: peliculaCompleta$
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ basica, completa }) => {
        this.pelicula = basica;
        this.peliculaCompleta = completa;

        if (this.sedeSeleccionada) {
          this.loadFunciones(id);
        } else {
          // Si no hay sede, al menos configurar el carrusel con las imágenes
          this.setupMediaCarousel();
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error loading movie data:', err);
        
        // Si falla la película completa, intentar solo la básica
        this.movieService.getPeliculaById(id).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: (pelicula) => {
            this.pelicula = pelicula;
            console.warn('⚠️ Solo se cargó película básica, datos extendidos no disponibles');
            
            if (this.sedeSeleccionada) {
              this.loadFunciones(id);
            } else {
              this.setupMediaCarousel();
              this.isLoading = false;
            }
          },
          error: (basicErr) => {
            console.error('Error loading basic movie data:', basicErr);
            this.isLoading = false;
            
            let errorMessage = 'No se pudo cargar la información de la película';
            
            if (basicErr.status === 404) {
              errorMessage = 'La película no existe o no se encuentra disponible';
            } else if (basicErr.status === 500) {
              errorMessage = 'Error del servidor. Intenta nuevamente más tarde';
            } else if (basicErr.status === 0) {
              errorMessage = 'Error de conexión. Verifica tu conexión a internet';
            }
            
            Swal.fire({
              icon: 'error',
              title: 'Película no encontrada',
              text: errorMessage,
              confirmButtonText: 'Volver al inicio'
            }).then(() => {
              this.router.navigate(['/']);
            });
          }
        });
      }
    });
  }

  private loadFunciones(peliculaId: number): void {
    // Verificar que hay sede seleccionada
    if (!this.sedeSeleccionada?.id_sede) {
      console.warn('No hay sede seleccionada');
      this.funcionesPorIdioma = [];
      this.setupMediaCarousel();
      this.isLoading = false;
      return;
    }

    console.log('🎬 Cargando funciones optimizadas para película:', peliculaId, 'sede:', this.sedeSeleccionada);

    // Usar getFuncionesByPeliculaId para obtener solo las funciones de esta película
    this.funcionesService.getFuncionesByPeliculaId(peliculaId).pipe(
      takeUntil(this.destroy$),
      switchMap((funcionesDePelicula: any[]) => {
        // Filtrar solo funciones activas
        const funcionesActivas = funcionesDePelicula.filter(f => f.estado === 'activa');

        if (funcionesActivas.length === 0) {
          this.funcionesPorIdioma = [];
          this.setupMediaCarousel();
          this.isLoading = false;
          return [];
        }

        // Obtener salas únicas para evitar verificaciones duplicadas
        const salasUnicas = [...new Set(funcionesActivas.map(f => f.id_sala))];
        
        // Verificar sedes de todas las salas únicas en paralelo
        const verificacionesDeSedes = salasUnicas.map(idSala =>
          this.sedeSalasService.getSedesBySala(idSala).pipe(
            takeUntil(this.destroy$)
          )
        );

        // Agregar verificación de salas de la sede seleccionada para debugging
        const salasDeSedeActual$ = this.sedeSalasService.getSalasBySede(this.sedeSeleccionada.id_sede).pipe(
          takeUntil(this.destroy$)
        );

        return forkJoin([
          forkJoin(verificacionesDeSedes),
          salasDeSedeActual$
        ]).pipe(
          switchMap(([resultadosSedesPorSala, salasDeSedeActual]: [any[][], any[]]) => {
            // Crear mapa de sala -> sedes para lookup rápido
            const mapaSedesPorSala = new Map<number, any>();
            salasUnicas.forEach((idSala, index) => {
              mapaSedesPorSala.set(idSala, resultadosSedesPorSala[index] || []);
            });

            // Filtrar funciones que pertenecen a la sede seleccionada
            const funcionesDeLaSede = funcionesActivas.filter(funcion => {
              const sedesDeLaSala = mapaSedesPorSala.get(funcion.id_sala) || [];

              let perteneceASede = false;
              if (this.FILTRADO_ESTRICTO) {
                // ESTRATEGIA ESTRICTA: Solo salas asignadas únicamente a la sede seleccionada
                const esSalaUnicaDeLaSede = sedesDeLaSala.length === 1;
                perteneceASede = esSalaUnicaDeLaSede &&
                  sedesDeLaSala[0].id_sede === this.sedeSeleccionada.id_sede;
              } else {
                // ESTRATEGIA FLEXIBLE: Cualquier sala que esté asignada a la sede
                perteneceASede = sedesDeLaSala.some((ss: any) => ss.id_sede === this.sedeSeleccionada.id_sede);
              }

              return perteneceASede;
            });

            if (funcionesDeLaSede.length === 0) {
              this.funcionesPorIdioma = [];
              this.funcionesCompletas = [];
              this.setupMediaCarouselWithFallback(funcionesActivas);
              return [];
            }

            // Guardar funciones completas para uso posterior
            this.funcionesCompletas = funcionesDeLaSede;

            // Agrupar por idioma las funciones de la sede
            const funcionesPorIdiomaMap = new Map<string, any[]>();

            funcionesDeLaSede.forEach((funcion: any) => {
              const idioma = funcion.idioma || 'Español';
              if (!funcionesPorIdiomaMap.has(idioma)) {
                funcionesPorIdiomaMap.set(idioma, []);
              }
              funcionesPorIdiomaMap.get(idioma)?.push(funcion);
            });

            // Convertir a formato esperado
            this.funcionesPorIdioma = Array.from(funcionesPorIdiomaMap.entries()).map(([idioma, funciones]) => ({
              idioma: idioma,
              horarios: funciones.map((f: any) => this.formatearHora(f.fecha_hora_inicio)),
              trailer: this.convertToEmbedUrl(funciones[0].trailer_url) || this.generarTrailerGenerico(),
              precio: funciones[0].precio || 8.50
            }));

            if (this.funcionesPorIdioma.length > 0) {
              this.idiomaSeleccionado = this.funcionesPorIdioma[0].idioma;
              this.updateTrailerUrl(this.funcionesPorIdioma[0].trailer);
              this.setupMediaCarousel();
            }
            
            this.isLoading = false;

            return this.funcionesPorIdioma;
          })
        );
      })
    ).subscribe({
      next: () => {
        // Carga completada exitosamente
      },
      error: (err: any) => {
        console.error('Error en carga de funciones:', err);
        this.funcionesPorIdioma = [];
        this.setupMediaCarousel();
        this.isLoading = false;
      }
    });
  }



  private convertToEmbedUrl(youtubeUrl: string): string {
    if (!youtubeUrl) return this.generarTrailerGenerico();

    // Si ya es una URL de embed, devolverla tal como está
    if (youtubeUrl.includes('embed')) {
      return youtubeUrl;
    }

    // Extraer ID del video de diferentes formatos de YouTube
    let videoId = '';

    // youtube.com/watch?v=ID
    if (youtubeUrl.includes('watch?v=')) {
      videoId = youtubeUrl.split('watch?v=')[1].split('&')[0];
    }
    // youtu.be/ID
    else if (youtubeUrl.includes('youtu.be/')) {
      videoId = youtubeUrl.split('youtu.be/')[1].split('?')[0];
    }
    // youtube.com/embed/ID (ya está en formato correcto)
    else if (youtubeUrl.includes('youtube.com/embed/')) {
      return youtubeUrl;
    }

    // Si no se pudo extraer ID, usar trailer genérico
    if (!videoId) {
      return this.generarTrailerGenerico();
    }

    return `https://www.youtube.com/embed/${videoId}`;
  }

  private formatearHora(fechaHora: string): string {
    // Convertir "2025-07-09T20:10:00.000Z" a "20:10"
    const fecha = new Date(fechaHora);
    return fecha.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  private generarTrailerGenerico(): string {
    // Usar un trailer genérico de YouTube (embedded)
    return 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  }

  private setupMediaCarousel(): void {
    this.setupUnifiedMediaCarousel();
  }

  private setupMediaCarouselWithFallback(funcionesDePelicula: any[]): void {
    this.setupUnifiedMediaCarousel(funcionesDePelicula);
  }

  private setupUnifiedMediaCarousel(funcionesDePelicula?: any[]): void {
    this.mediaItems = [];

    // 1. SIEMPRE agregar un trailer, con lógica de fallback inteligente
    let trailerUrl = '';

    // Prioridad 1: Trailer de funciones de la sede seleccionada (si hay idioma seleccionado)
    if (this.funcionesPorIdioma.length > 0) {
      const funcionIdioma = this.funcionesPorIdioma.find(f => f.idioma === this.idiomaSeleccionado) || this.funcionesPorIdioma[0];
      if (funcionIdioma.trailer) {
        trailerUrl = funcionIdioma.trailer;
      }
    }

    // Prioridad 2: Trailer de cualquier función de la película (si se pasó funcionesDePelicula)
    if (!trailerUrl && funcionesDePelicula && funcionesDePelicula.length > 0) {
      // Preferir función con idioma seleccionado, sino la primera con trailer
      const funcionPreferida = funcionesDePelicula.find(f =>
        f.idioma === this.idiomaSeleccionado && f.trailer_url
      ) || funcionesDePelicula.find(f => f.trailer_url);

      if (funcionPreferida?.trailer_url) {
        trailerUrl = this.convertToEmbedUrl(funcionPreferida.trailer_url) || '';
      }
    }

    // Prioridad 3: Trailer genérico basado en el título
    if (!trailerUrl) {
      trailerUrl = this.generarTrailerGenerico();
    }

    // Crear array temporal de elementos originales
    const originalItems: MediaItem[] = [];

    // Agregar el trailer al array original
    originalItems.push({
      type: 'video',
      url: trailerUrl,
      thumbnail: this.getVideoThumbnail(trailerUrl),
      title: 'Tráiler'
    });

    // 2. SIEMPRE agregar imágenes adicionales (independiente de funciones de sede)
    if (this.pelicula?.img_carrusel && this.pelicula.img_carrusel.length > 0) {
      this.pelicula.img_carrusel.forEach((img, index) => {
        originalItems.push({
          type: 'image',
          url: img.url,
          thumbnail: img.url,
          title: `Imagen ${index + 1}`
        });
      });
    }

    // 3. Crear carrusel infinito duplicando elementos para scroll continuo
    if (originalItems.length > 0) {
      // Para un scroll infinito visual, duplicar elementos solo una vez
      // [Original, Duplicado] - más simple y confiable
      this.mediaItems = [...originalItems, ...originalItems];

      // Configurar estado inicial del carrusel - empezar en el primer conjunto (posición 0)
      this.selectedMediaIndex = 0; // Índice lógico (del array original)
      this.currentMediaIndex = 0; // Índice visual (empezar en el primer conjunto)
      this.originalItemsCount = originalItems.length;
      this.updateTrailerUrl(trailerUrl); // Actualizar el trailer mostrado

      // Asegurar que la vista previa se configure correctamente
      this.updatePreviewFromCurrentIndex();
    }

    console.log('🎬 Carrusel configurado:', {
      originalItems: originalItems.length,
      totalItemsInCarousel: this.mediaItems.length,
      functionsInVenue: this.funcionesPorIdioma.length
    });
  }

  private getVideoThumbnail(youtubeUrl: string): string {
    // Extraer ID del video de YouTube para generar thumbnail
    const videoId = this.extractYouTubeVideoId(youtubeUrl);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
  }

  private extractYouTubeVideoId(url: string): string {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  }

  private checkSedeSeleccionada(): void {
    try {
      const sedeGuardada = localStorage.getItem('sedeSeleccionada');
      if (sedeGuardada) {
        this.sedeSeleccionada = JSON.parse(sedeGuardada);
      } else {
        this.sedeSeleccionada = null;
      }
    } catch (error) {
      console.error('Error parsing sede from localStorage:', error);
      this.sedeSeleccionada = null;
    }
  }

  private updateTrailerUrl(trailerUrl: string): void {
    this.safeTrailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(trailerUrl);
  }

  // Métodos de la UI
  cambiarCantidad(delta: number): void {
    const nuevaCantidad = this.cantidad + delta;
    
    if (nuevaCantidad >= 1 && nuevaCantidad <= this.maxAsientosDisponibles) {
      this.cantidad = nuevaCantidad;
    }
  }

  // Getter para verificar si se puede aumentar la cantidad
  get puedeAumentarCantidad(): boolean {
    return this.cantidad < this.maxAsientosDisponibles;
  }

  // Getter para verificar si la función está seleccionada
  get funcionSeleccionada(): boolean {
    return this.idiomaSeleccionado !== '' && this.horarioSeleccionado !== '';
  }

  // Método para obtener información de asientos disponibles
  private actualizarAsientosDisponibles(): void {
    if (!this.idiomaSeleccionado || !this.horarioSeleccionado) {
      // Si no hay idioma u horario seleccionado, usar valores por defecto
      this.totalAsientos = 50;
      this.asientosOcupados = 0;
      this.maxAsientosDisponibles = this.totalAsientos;
      return;
    }

    // Obtener el ID de la sala para el idioma y horario seleccionados
    const idSala = this.obtenerIdSalaPorIdiomaYHorario();
    
    if (!idSala) {
      console.warn('No se pudo obtener ID de sala, usando valores por defecto');
      this.totalAsientos = 50;
      this.asientosOcupados = 0;
      this.maxAsientosDisponibles = this.totalAsientos;
      return;
    }

    // Consultar los asientos reales de la sala
    this.salasService.getAsientosPorSala(idSala).subscribe({
      next: (asientosDB: any[]) => {
        // Calcular asientos disponibles reales
        let disponibles = 0;
        let total = 0;
        
        asientosDB.forEach((asiento: any) => {
          // Solo contar asientos normales (no espacios)
          if (asiento.tipo !== 'espacio') {
            total++;
            if (!asiento.ocupado) {
              disponibles++;
            }
          }
        });

        this.totalAsientos = total;
        this.asientosOcupados = total - disponibles;
        this.maxAsientosDisponibles = disponibles;
        
        console.log(`Sala ${idSala}: ${disponibles} asientos disponibles de ${total} totales`);
        
        // Asegurar que hay al menos 1 asiento disponible para el selector
        if (this.maxAsientosDisponibles <= 0) {
          this.maxAsientosDisponibles = 1; // Para que la UI no se rompa
        }
        
        // Ajustar la cantidad si excede el máximo disponible
        if (this.cantidad > this.maxAsientosDisponibles) {
          this.cantidad = Math.max(1, this.maxAsientosDisponibles);
          console.log(`Cantidad ajustada a: ${this.cantidad}`);
        }
      },
      error: (error: any) => {
        console.error('Error obteniendo asientos de la sala:', error);
        // Fallback a valores simulados
        this.totalAsientos = 50;
        this.asientosOcupados = 20;
        this.maxAsientosDisponibles = 30;
        
        if (this.cantidad > this.maxAsientosDisponibles) {
          this.cantidad = Math.max(1, this.maxAsientosDisponibles);
        }
      }
    });
  }

  // Método para seleccionar horario y actualizar asientos disponibles
  seleccionarHorario(horario: string): void {
    this.horarioSeleccionado = horario;
    this.actualizarAsientosDisponibles();
  }

  selectIdioma(idioma: string, trailerUrl: string): void {
    this.idiomaSeleccionado = idioma;
    this.horarioSeleccionado = ''; // Reset horario seleccionado

    // Actualizar asientos disponibles cuando se selecciona un idioma
    this.actualizarAsientosDisponibles();

    // Convertir URL a formato embed antes de usar
    const embedUrl = this.convertToEmbedUrl(trailerUrl);
    this.updateTrailerUrl(embedUrl);

    // Actualizar el tráiler en el carousel si existe
    if (this.mediaItems.length > 0 && this.mediaItems[0].type === 'video') {
      this.mediaItems[0].url = embedUrl;
      this.mediaItems[0].thumbnail = this.getVideoThumbnail(trailerUrl);

      // Si el tráiler está seleccionado, actualizar la vista previa
      if (this.selectedMediaIndex === 0) {
        this.safeTrailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
      }
    }
  }

  async irASiguiente(): Promise<void> {
    // Verificar si el usuario está logueado
    if (!this.authService.getUsuarioActual()) {
      // Mostrar modal de login
      Swal.fire({
        title: 'Iniciar Sesión',
        text: 'Debes iniciar sesión para comprar boletos',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Iniciar Sesión',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    // Validar que se haya seleccionado un horario
    if (!this.horarioSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona un horario',
        text: 'Por favor selecciona un horario para continuar'
      });
      return;
    }

    // Navegación directa sin loader (se moverá al select-seat)

    // Redirigir a la página de selección de asientos
    this.router.navigate(['/select-seat'], {
      queryParams: {
        pelicula: this.pelicula?.id_pelicula,
        titulo: this.pelicula?.titulo,
        idioma: this.idiomaSeleccionado,
        horario: this.horarioSeleccionado,
        cantidad: this.cantidad,
        precio: this.obtenerPrecioPorIdioma(),
        total: this.obtenerPrecioTotal(),
        id_sala: this.obtenerIdSalaPorIdiomaYHorario(),
        funcion_id: this.obtenerIdFuncionPorIdiomaYHorario() // Agregar ID de función real
      }
    });
  }

  // Métodos del carousel
  navigateCarousel(direction: number): void {
    if (this.mediaItems.length === 0 || this.originalItemsCount === 0) return;

    if (direction === 1) {
      // Avanzar
      this.currentMediaIndex++;

      // Si llegamos al final del array duplicado, resetear al principio
      if (this.currentMediaIndex >= this.mediaItems.length) {
        this.currentMediaIndex = this.originalItemsCount; // Ir al inicio del segundo conjunto
      }
    } else if (direction === -1) {
      // Retroceder
      this.currentMediaIndex--;

      // Si llegamos antes del principio, ir al final
      if (this.currentMediaIndex < 0) {
        this.currentMediaIndex = this.originalItemsCount - 1; // Ir al final del primer conjunto
      }
    }

    // Calcular el índice lógico y actualizar vista previa inmediatamente
    const logicalIndex = this.currentMediaIndex % this.originalItemsCount;
    this.selectedMediaIndex = logicalIndex;
    this.updatePreviewFromCurrentIndex();

    // Programar reset para crear efecto infinito visual
    this.scheduleInfiniteReset();
  }

  private scheduleInfiniteReset(): void {
    // Después de la animación, verificar si necesitamos resetear para el efecto infinito
    setTimeout(() => {
      const track = document.querySelector('.carousel-track') as HTMLElement;
      if (!track) return;

      let needsReset = false;
      let newPosition = this.currentMediaIndex;

      // Si estamos en el segundo conjunto, resetear al primer conjunto equivalente
      if (this.currentMediaIndex >= this.originalItemsCount && this.currentMediaIndex < this.originalItemsCount * 2) {
        newPosition = this.currentMediaIndex - this.originalItemsCount;
        needsReset = true;
      }

      if (needsReset) {
        // Desactivar transición para reset invisible
        track.classList.add('no-transition');
        this.currentMediaIndex = newPosition;

        // Forzar repaint y reactivar transición
        track.offsetHeight;
        setTimeout(() => {
          track.classList.remove('no-transition');
        }, 10);
      }
    }, 300);
  }

  private updatePreviewFromCurrentIndex(): void {
    // Obtener el elemento actual del carrusel
    if (this.currentMediaIndex >= 0 && this.currentMediaIndex < this.mediaItems.length) {
      const mediaItem = this.mediaItems[this.currentMediaIndex];

      if (mediaItem.type === 'video') {
        this.safeTrailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mediaItem.url);
      }
      // Para imágenes, la vista previa se maneja en el HTML
    }
  }

  getCarouselOffset(): number {
    // Mostrar 3 elementos centrados, cada elemento ocupa 150px + 12px gap = 162px
    // El carrusel se mueve de uno en uno
    return -(this.currentMediaIndex * 162);
  }

  selectMedia(logicalIndex: number): void {
    // Actualizar el índice lógico seleccionado
    this.selectedMediaIndex = logicalIndex;

    // Usar el método unificado para actualizar la vista previa
    this.updatePreviewFromCurrentIndex();
  }

  getLogicalIndex(visualIndex: number): number {
    // Convertir índice visual a índice lógico
    return this.originalItemsCount > 0 ? visualIndex % this.originalItemsCount : 0;
  }

  onMediaClick(visualIndex: number): void {
    // Cuando se hace click en una imagen, actualizar posición del carrusel y vista previa
    this.currentMediaIndex = visualIndex;
    const logicalIndex = this.getLogicalIndex(visualIndex);
    this.selectMedia(logicalIndex);
  }

  // Métodos para obtener información de la película
  obtenerHorariosPorIdioma(): string[] {
    const funciones = this.funcionesPorIdioma.find(
      (f) => f.idioma === this.idiomaSeleccionado
    );
    return funciones ? funciones.horarios : [];
  }

  obtenerHorarioConFin(horario: string): string {
    if (!this.pelicula?.duracion_minutos) {
      return horario;
    }

    try {
      // Parsear la hora de inicio (formato HH:MM)
      const [horaStr, minutoStr] = horario.split(':');
      const horaInicio = parseInt(horaStr);
      const minutoInicio = parseInt(minutoStr);
      
      // Calcular hora de fin
      let minutosTotales = horaInicio * 60 + minutoInicio + this.pelicula.duracion_minutos;
      let horaFin = Math.floor(minutosTotales / 60);
      let minutoFin = minutosTotales % 60;
      
      // Manejar cambio de día (24h+)
      if (horaFin >= 24) {
        horaFin = horaFin - 24;
      }
      
      // Formatear con ceros a la izquierda
      const horaFinStr = horaFin.toString().padStart(2, '0');
      const minutoFinStr = minutoFin.toString().padStart(2, '0');
      
      return `${horario} - ${horaFinStr}:${minutoFinStr}`;
    } catch (error) {
      console.error('Error calculando hora de fin:', error);
      return horario;
    }
  }

  obtenerPrecioPorIdioma(): number | string {
    // Si hay idioma y horario seleccionados, buscar la función específica
    if (this.idiomaSeleccionado && this.horarioSeleccionado && this.funcionesCompletas.length > 0) {
      const funcionEspecifica = this.funcionesCompletas.find(funcion => {
        const idiomaCoincide = funcion.idioma === this.idiomaSeleccionado;
        const horarioFormateado = this.formatearHora(funcion.fecha_hora_inicio);
        const horarioCoincide = horarioFormateado === this.horarioSeleccionado;
        
        return idiomaCoincide && horarioCoincide;
      });

      if (funcionEspecifica && funcionEspecifica.precio) {
        return funcionEspecifica.precio;
      }
    }

    // Fallback al método anterior
    const funcion = this.funcionesPorIdioma.find(f => f.idioma === this.idiomaSeleccionado);
    return funcion && funcion.precio ? funcion.precio : 'N/A';
  }

  obtenerPrecioTotal(): number | string {
    const precio = this.obtenerPrecioPorIdioma();
    return typeof precio === 'number' ? precio * this.cantidad : 'N/A';
  }



  getGeneros(): string {
    if (!this.peliculaCompleta?.generos) return 'No disponible';
    
    // Si es un array de strings (formato optimizado)
    if (Array.isArray(this.peliculaCompleta.generos) && typeof this.peliculaCompleta.generos[0] === 'string') {
      return this.peliculaCompleta.generos.join(', ');
    }
    
    // Si es un array de objetos (formato tradicional)
    if (Array.isArray(this.peliculaCompleta.generos) && typeof this.peliculaCompleta.generos[0] === 'object') {
      return this.peliculaCompleta.generos.map((g: any) => g.nombre).join(', ');
    }
    
    return 'No disponible';
  }

  getActores(): string {
    if (!this.peliculaCompleta?.actores) return 'No disponible';
    
    // Si es un array de strings (formato optimizado)
    if (Array.isArray(this.peliculaCompleta.actores) && typeof this.peliculaCompleta.actores[0] === 'string') {
      return this.peliculaCompleta.actores.join(', ');
    }
    
    // Si es un array de objetos (formato tradicional)
    if (Array.isArray(this.peliculaCompleta.actores) && typeof this.peliculaCompleta.actores[0] === 'object') {
      return this.peliculaCompleta.actores.map((a: any) => a.nombre).join(', ');
    }
    
    return 'No disponible';
  }

  getIdiomas(): string {
    if (!this.peliculaCompleta?.idiomas) return 'No disponible';
    
    // Si es un array de strings (formato optimizado)
    if (Array.isArray(this.peliculaCompleta.idiomas) && typeof this.peliculaCompleta.idiomas[0] === 'string') {
      return this.peliculaCompleta.idiomas.join(', ');
    }
    
    // Si es un array de objetos (formato tradicional)
    if (Array.isArray(this.peliculaCompleta.idiomas) && typeof this.peliculaCompleta.idiomas[0] === 'object') {
      return this.peliculaCompleta.idiomas.map((i: any) => i.nombre).join(', ');
    }
    
    return 'No disponible';
  }

  getEtiquetas(): string {
    if (!this.peliculaCompleta?.etiquetas) return 'No disponible';
    
    // Si es un array de strings (formato optimizado)
    if (Array.isArray(this.peliculaCompleta.etiquetas) && typeof this.peliculaCompleta.etiquetas[0] === 'string') {
      return this.peliculaCompleta.etiquetas.join(', ');
    }
    
    // Si es un array de objetos (formato tradicional)
    if (Array.isArray(this.peliculaCompleta.etiquetas) && typeof this.peliculaCompleta.etiquetas[0] === 'object') {
      return this.peliculaCompleta.etiquetas.map((e: any) => e.nombre).join(', ');
    }
    
    return 'No disponible';
  }

  getDistribuidor(): string {
    if (!this.peliculaCompleta?.distribuidor && !this.peliculaCompleta?.id_distribuidor) return 'No disponible';
    
    // Prioridad 1: Campo distribuidor directo (formato optimizado)
    if (this.peliculaCompleta?.distribuidor) {
      if (typeof this.peliculaCompleta.distribuidor === 'string') {
        return this.peliculaCompleta.distribuidor;
      }
      if (typeof this.peliculaCompleta.distribuidor === 'object' && this.peliculaCompleta.distribuidor.nombre) {
        return this.peliculaCompleta.distribuidor.nombre;
      }
    }
    
    // Prioridad 2: Campo id_distribuidor (formato tradicional)
    if (this.peliculaCompleta?.id_distribuidor) {
      if (typeof this.peliculaCompleta.id_distribuidor === 'string') {
        return this.peliculaCompleta.id_distribuidor;
      }
      if (typeof this.peliculaCompleta.id_distribuidor === 'object' && this.peliculaCompleta.id_distribuidor.nombre) {
        return this.peliculaCompleta.id_distribuidor.nombre;
      }
    }
    
    return 'No disponible';
  }

  getEstadoLabel(estado: string): string {
    const estados: { [key: string]: string } = {
      'activo': 'En cartelera',
      'proximamente': 'Próximamente',
      'retirada': 'Retirada'
    };
    return estados[estado] || estado;
  }

  // Método para obtener id_sala basado en idioma y horario seleccionados
  private obtenerIdSalaPorIdiomaYHorario(): number | null {
    if (!this.idiomaSeleccionado || !this.horarioSeleccionado || !this.funcionesCompletas.length) {
      return null;
    }

    const funcionEncontrada = this.funcionesCompletas.find(funcion => {
      const idiomaCoincide = funcion.idioma === this.idiomaSeleccionado;
      const horarioFormateado = this.formatearHora(funcion.fecha_hora_inicio);
      const horarioCoincide = horarioFormateado === this.horarioSeleccionado;
      
      return idiomaCoincide && horarioCoincide;
    });

    return funcionEncontrada ? funcionEncontrada.id_sala : null;
  }

  // Método para obtener id_funcion basado en idioma y horario seleccionados
  private obtenerIdFuncionPorIdiomaYHorario(): number | null {
    if (!this.idiomaSeleccionado || !this.horarioSeleccionado || !this.funcionesCompletas.length) {
      return null;
    }

    const funcionEncontrada = this.funcionesCompletas.find(funcion => {
      const idiomaCoincide = funcion.idioma === this.idiomaSeleccionado;
      const horarioFormateado = this.formatearHora(funcion.fecha_hora_inicio);
      const horarioCoincide = horarioFormateado === this.horarioSeleccionado;
      
      return idiomaCoincide && horarioCoincide;
    });

    return funcionEncontrada ? funcionEncontrada.id_funcion : null;
  }
}
