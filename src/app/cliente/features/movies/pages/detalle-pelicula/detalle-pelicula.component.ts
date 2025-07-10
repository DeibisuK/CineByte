import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarouselEstrenosComponent } from '../carousel-estrenos/carousel-estrenos.component';
import { Pelicula } from '../../../../../admin/models/pelicula.model';
import { PeliculaService } from '../../../../../services/pelicula.service';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { AuthService } from '../../../../../services/AuthService';
import { FuncionesService } from '../../../../../services/funciones.service';
import { SedeSalasService } from '../../../../../services/sede-salas.service';
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

  // Estado de sede
  sedeSeleccionada: any = null; // Cambiar a objeto completo en lugar de string

  // Configuración del filtrado de funciones
  private readonly FILTRADO_ESTRICTO = true; // Solo salas asignadas únicamente a la sede
  private readonly MOSTRAR_DEBUG_FILTRADO = true; // Mostrar información de debugging

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
        
        console.log('🎬 Película cargada:', { basica, completa });

        if (this.sedeSeleccionada) {
          this.loadFunciones(id);
        } else {
          // Si no hay sede, al menos configurar el carrusel con las imágenes
          this.setupMediaCarousel();
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
            }
          },
          error: (basicErr) => {
            console.error('Error loading basic movie data:', basicErr);
            
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
      return;
    }

    console.log('🎬 Cargando funciones optimizadas para película:', peliculaId, 'sede:', this.sedeSeleccionada);

    // OPTIMIZACIÓN: Usar getFuncionesByPeliculaId para obtener solo las funciones de esta película
    this.funcionesService.getFuncionesByPeliculaId(peliculaId).pipe(
      takeUntil(this.destroy$),
      switchMap((funcionesDePelicula: any[]) => {
        console.log('✅ Funciones de la película obtenidas:', funcionesDePelicula.length);

        // Filtrar solo funciones activas
        const funcionesActivas = funcionesDePelicula.filter(f => f.estado === 'activa');

        if (funcionesActivas.length === 0) {
          console.warn('No se encontraron funciones activas para esta película');
          this.funcionesPorIdioma = [];
          this.setupMediaCarousel();
          return [];
        }

        // OPTIMIZACIÓN: Obtener salas únicas para evitar verificaciones duplicadas
        const salasUnicas = [...new Set(funcionesActivas.map(f => f.id_sala))];
        console.log('🔧 Verificando sedes para', salasUnicas.length, 'salas únicas');

        // Verificar sedes de todas las salas únicas en paralelo
        const verificacionesDeSedes = salasUnicas.map(idSala =>
          this.sedeSalasService.getSedesBySala(idSala).pipe(
            takeUntil(this.destroy$)
          )
        );

        return forkJoin(verificacionesDeSedes).pipe(
          switchMap((resultadosSedesPorSala: any[][]) => {
            // Crear mapa de sala -> sedes para lookup rápido
            const mapaSedesPorSala = new Map<number, any[]>();
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

              if (this.MOSTRAR_DEBUG_FILTRADO) {
                console.log(`🏛️ Sala ${funcion.id_sala}:`, {
                  asignaciones: sedesDeLaSala.map((ss: any) => ss.id_sede),
                  sedeSeleccionada: this.sedeSeleccionada.id_sede,
                  estrategia: this.FILTRADO_ESTRICTO ? 'ESTRICTA' : 'FLEXIBLE',
                  esSalaUnica: sedesDeLaSala.length === 1,
                  perteneceASede
                });
              }

              return perteneceASede;
            });

            console.log('=== ANÁLISIS OPTIMIZADO DE FILTRADO ===');
            console.log(`📊 Funciones procesadas: ${funcionesDePelicula.length} total → ${funcionesActivas.length} activas → ${funcionesDeLaSede.length} en sede`);
            console.log(`🎯 Estrategia: ${this.FILTRADO_ESTRICTO ? 'ESTRICTA' : 'FLEXIBLE'}`);
            console.log(`⚡ Verificaciones de sede: ${salasUnicas.length} (optimizado)`);
            console.log('=====================================');

            if (funcionesDeLaSede.length === 0) {
              console.warn('❌ No se encontraron funciones para esta película en la sede seleccionada');
              this.funcionesPorIdioma = [];
              this.setupMediaCarouselWithFallback(funcionesActivas);
              return [];
            }

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
              precio: funciones[0].precio || 8.50 // Usar 'precio' en lugar de 'precio_funcion'
            }));

            console.log('🎉 Funciones por idioma optimizadas:', this.funcionesPorIdioma);

            if (this.funcionesPorIdioma.length > 0) {
              this.idiomaSeleccionado = this.funcionesPorIdioma[0].idioma;
              this.updateTrailerUrl(this.funcionesPorIdioma[0].trailer);
              this.setupMediaCarousel();
            }

            return this.funcionesPorIdioma;
          })
        );
      })
    ).subscribe({
      next: () => {
        console.log('✅ Carga optimizada completada exitosamente');
      },
      error: (err: any) => {
        console.error('❌ Error en carga optimizada de funciones:', err);
        this.funcionesPorIdioma = [];
        this.setupMediaCarousel();
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

    console.log('🎬 Carrusel infinito configurado:', {
      originalItems: originalItems.length,
      totalItemsInCarousel: this.mediaItems.length,
      startingAt: this.currentMediaIndex,
      trailerUsed: trailerUrl,
      hasImagesFromMovie: this.pelicula?.img_carrusel?.length || 0,
      functionsInVenue: this.funcionesPorIdioma.length,
      functionsInMovie: funcionesDePelicula?.length || 0
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
    if (this.cantidad + delta >= 1) {
      this.cantidad += delta;
    }
  }

  selectIdioma(idioma: string, trailerUrl: string): void {
    this.idiomaSeleccionado = idioma;
    this.horarioSeleccionado = ''; // Reset horario seleccionado

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

  irASiguiente(): void {
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

    // Redirigir a la página de compra (por ahora '#')
    this.router.navigate(['/compra'], {
      queryParams: {
        pelicula: this.pelicula?.id_pelicula,
        idioma: this.idiomaSeleccionado,
        horario: this.horarioSeleccionado,
        cantidad: this.cantidad
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

  obtenerPrecioPorIdioma(): number | string {
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
}
