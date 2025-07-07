import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Pelicula } from '../../../models/pelicula.model';
import { PeliculaService } from '../../../../services/pelicula.service';
import { GenerosService } from '../../../../services/generos.service';
import { EtiquetasService } from '../../../../services/etiquetas.service';
import { ImgbbService } from '../../../../services/imgbb.service';
import { DistribuidorService } from '../../../../services/distribuidor.service';
import { ActoresService } from '../../../../services/actores.service';
import { IdiomasService } from '../../../../services/idiomas.service';
import { Etiquetas } from '../../../models/etiquetas.model';
import { Generos } from '../../../models/generos.model';
import { Distribuidor } from '../../../models/distribuidor.model';
import { Idiomas } from '../../../models/idiomas.model';
import { Actores } from '../../../models/actores.model';
import { Router, RouterModule } from '@angular/router';
import { AlertaService } from '../../../../services/alerta.service';
import { CrearActorComponent } from "../../actores/crear-actor/crear-actor.component";
import { CrearDistribuidorComponent } from '../../distribuidor/crear-distribuidor/crear-distribuidor.component';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-crear-pelicula',
  imports: [ReactiveFormsModule, CommonModule, CrearActorComponent,
    CrearDistribuidorComponent, RouterModule, FormsModule
  ],
  templateUrl: './crear-pelicula.component.html',
  styleUrl: './crear-pelicula.component.css'
})
export class CrearPeliculaComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  peliculaForm: FormGroup;
  generos: Generos[] = [];
  etiquetas: Etiquetas[] = [];
  distribuidor: Distribuidor[] = [];
  actores: Actores[] = [];
  idiomas: Idiomas[] = [];
  selectedGenres: Generos[] = [];
  selectedTags: Etiquetas[] = [];
  selectedActores: Actores[] = [];
  selectedIdiomas: Idiomas[] = [];
  selectedDistribuidor: Distribuidor | null = null;
  clasificaciones: string[] = ['G', 'PG', 'PG-13', 'R', 'NC-17'];
  imagenSeleccionada!: File;
  imagenPreview: string = '';
  mostrarModalActor = false;
  mostrarModalDistribuidor = false;

  // Propiedades para los selectores tipo buscador
  idiomasSearchTerm: string = '';
  generosSearchTerm: string = '';
  actoresSearchTerm: string = '';
  etiquetasSearchTerm: string = '';
  distribuidorSearchTerm: string = '';
  
  filteredIdiomas: Idiomas[] = [];
  filteredGeneros: Generos[] = [];
  filteredActores: Actores[] = [];
  filteredEtiquetas: Etiquetas[] = [];
  filteredDistribuidores: Distribuidor[] = [];
  
  showIdiomasDropdown: boolean = false;
  showGenerosDropdown: boolean = false;
  showActoresDropdown: boolean = false;
  showEtiquetasDropdown: boolean = false;
  showDistribuidorDropdown: boolean = false;

  imagenesAdicionales: { preview: string, file: File }[] = [];
  currentSlideIndex = 0;

  abrirModal(tipo: 'actor' | 'distribuidor') {
    if (tipo === 'actor') {
      this.mostrarModalActor = true;
    } else {
      this.mostrarModalDistribuidor = true;
    }
  }

  cerrarModal(tipo: 'actor' | 'distribuidor') {
    if (tipo === 'actor') {
      this.mostrarModalActor = false;
    } else {
      this.mostrarModalDistribuidor = false;
    }
    this.cargarDatos();
    this.reset();
  }

  // Métodos de filtrado para los selectores tipo buscador
  filterIdiomas(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value.toLowerCase();
    this.idiomasSearchTerm = target.value;
    
    // Filtrar idiomas disponibles (no seleccionados)
    const availableIdiomas = this.idiomas.filter(idioma => 
      !this.selectedIdiomas.some(selected => selected.id_idioma === idioma.id_idioma)
    );
    
    this.filteredIdiomas = availableIdiomas.filter(idioma =>
      idioma.nombre.toLowerCase().includes(query)
    );
    this.showIdiomasDropdown = true;
  }

  filterGeneros(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value.toLowerCase();
    this.generosSearchTerm = target.value;
    
    // Filtrar géneros disponibles (no seleccionados)
    const availableGeneros = this.generos.filter(genero => 
      !this.selectedGenres.some(selected => selected.id_genero === genero.id_genero)
    );
    
    this.filteredGeneros = availableGeneros.filter(genero =>
      genero.nombre.toLowerCase().includes(query)
    );
    this.showGenerosDropdown = true;
  }

  filterActores(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value.toLowerCase();
    this.actoresSearchTerm = target.value;
    
    // Filtrar actores disponibles (no seleccionados)
    const availableActores = this.actores.filter(actor => 
      !this.selectedActores.some(selected => selected.id_actor === actor.id_actor)
    );
    
    this.filteredActores = availableActores.filter(actor =>
      actor.nombre.toLowerCase().includes(query) || 
      actor.apellidos.toLowerCase().includes(query) ||
      `${actor.nombre} ${actor.apellidos}`.toLowerCase().includes(query)
    );
    this.showActoresDropdown = true;
  }

  filterEtiquetas(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value.toLowerCase();
    this.etiquetasSearchTerm = target.value;
    
    // Filtrar etiquetas disponibles (no seleccionadas)
    const availableEtiquetas = this.etiquetas.filter(etiqueta => 
      !this.selectedTags.some(selected => selected.id_etiqueta === etiqueta.id_etiqueta)
    );
    
    this.filteredEtiquetas = availableEtiquetas.filter(etiqueta =>
      etiqueta.nombre.toLowerCase().includes(query)
    );
    this.showEtiquetasDropdown = true;
  }

  filterDistribuidores(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value.toLowerCase();
    this.distribuidorSearchTerm = target.value;
    
    // Filtrar distribuidores disponibles (no seleccionados)
    const availableDistribuidores = this.distribuidor.filter(distribuidor => 
      (!this.selectedDistribuidor || this.selectedDistribuidor.id_distribuidora !== distribuidor.id_distribuidora)
    );
    
    this.filteredDistribuidores = availableDistribuidores.filter(distribuidor =>
      distribuidor.nombre.toLowerCase().includes(query)
    );
    this.showDistribuidorDropdown = true;
  }

  // Métodos auxiliares para inicialización de filtros
  private initializeIdiomasFilter(): void {
    this.filteredIdiomas = this.idiomas.filter(idioma => 
      !this.selectedIdiomas.some(selected => selected.id_idioma === idioma.id_idioma)
    );
  }

  private initializeGenerosFilter(): void {
    this.filteredGeneros = this.generos.filter(genero => 
      !this.selectedGenres.some(selected => selected.id_genero === genero.id_genero)
    );
  }

  private initializeActoresFilter(): void {
    this.filteredActores = this.actores.filter(actor => 
      !this.selectedActores.some(selected => selected.id_actor === actor.id_actor)
    );
  }

  private initializeEtiquetasFilter(): void {
    this.filteredEtiquetas = this.etiquetas.filter(etiqueta => 
      !this.selectedTags.some(selected => selected.id_etiqueta === etiqueta.id_etiqueta)
    );
  }

  private initializeDistribuidoresFilter(): void {
    this.filteredDistribuidores = this.distribuidor.filter(distribuidor => 
      (!this.selectedDistribuidor || this.selectedDistribuidor.id_distribuidora !== distribuidor.id_distribuidora)
    );
  }

  // Métodos de selección para los selectores tipo buscador
  selectIdioma(idioma: Idiomas): void {
    if (!this.selectedIdiomas.some(selected => selected.id_idioma === idioma.id_idioma)) {
      this.selectedIdiomas.push(idioma);
      this.idiomasSearchTerm = '';
      this.initializeIdiomasFilter();
    }
    this.showIdiomasDropdown = false;
  }

  selectGenero(genero: Generos): void {
    if (!this.selectedGenres.some(selected => selected.id_genero === genero.id_genero)) {
      this.selectedGenres.push(genero);
      this.generosSearchTerm = '';
      this.initializeGenerosFilter();
    }
    this.showGenerosDropdown = false;
  }

  selectActor(actor: Actores): void {
    if (!this.selectedActores.some(selected => selected.id_actor === actor.id_actor)) {
      this.selectedActores.push(actor);
      this.actoresSearchTerm = '';
      this.initializeActoresFilter();
    }
    this.showActoresDropdown = false;
  }

  selectEtiqueta(etiqueta: Etiquetas): void {
    if (!this.selectedTags.some(selected => selected.id_etiqueta === etiqueta.id_etiqueta)) {
      this.selectedTags.push(etiqueta);
      this.etiquetasSearchTerm = '';
      this.initializeEtiquetasFilter();
    }
    this.showEtiquetasDropdown = false;
  }

  // Métodos para dropdowns
  toggleIdiomasDropdown(): void {
    this.showIdiomasDropdown = !this.showIdiomasDropdown;
    if (this.showIdiomasDropdown) {
      this.initializeIdiomasFilter();
    }
  }

  toggleGenerosDropdown(): void {
    this.showGenerosDropdown = !this.showGenerosDropdown;
    if (this.showGenerosDropdown) {
      this.initializeGenerosFilter();
    }
  }

  toggleActoresDropdown(): void {
    this.showActoresDropdown = !this.showActoresDropdown;
    if (this.showActoresDropdown) {
      this.initializeActoresFilter();
    }
  }

  toggleEtiquetasDropdown(): void {
    this.showEtiquetasDropdown = !this.showEtiquetasDropdown;
    if (this.showEtiquetasDropdown) {
      this.initializeEtiquetasFilter();
    }
  }

  toggleDistribuidorDropdown(): void {
    this.showDistribuidorDropdown = !this.showDistribuidorDropdown;
    if (this.showDistribuidorDropdown) {
      this.initializeDistribuidoresFilter();
    }
  }

  selectDistribuidor(distribuidor: Distribuidor): void {
    this.selectedDistribuidor = distribuidor;
    this.peliculaForm.patchValue({ id_distribuidor: distribuidor.id_distribuidora });
    this.distribuidorSearchTerm = '';
    this.initializeDistribuidoresFilter();
    this.showDistribuidorDropdown = false;
  }

  removeDistribuidor(): void {
    this.selectedDistribuidor = null;
    this.peliculaForm.patchValue({ id_distribuidor: '' });
    this.distribuidorSearchTerm = '';
    this.initializeDistribuidoresFilter();
  }
  // Métodos de blur para cerrar dropdowns
  onIdiomasBlur(): void {
    setTimeout(() => this.showIdiomasDropdown = false, 200);
  }

  onGenerosBlur(): void {
    setTimeout(() => this.showGenerosDropdown = false, 200);
  }

  onActoresBlur(): void {
    setTimeout(() => this.showActoresDropdown = false, 200);
  }

  onEtiquetasBlur(): void {
    setTimeout(() => this.showEtiquetasDropdown = false, 200);
  }

  onDistribuidorBlur(): void {
    setTimeout(() => this.showDistribuidorDropdown = false, 200);
  }

  constructor(
    private peliculaService: PeliculaService,
    private generosService: GenerosService,
    private etiquetasService: EtiquetasService,
    private distribuidorService: DistribuidorService,
    private actoresService: ActoresService,
    private router: Router,
    private idiomaService: IdiomasService,
    private imgbbService: ImgbbService,
    private alerta: AlertaService
  ) {
    this.peliculaForm = new FormGroup({
      titulo: new FormControl('', Validators.required),
      descripcion: new FormControl('', Validators.required),
      duracion_minutos: new FormControl('', [Validators.required, Validators.min(1)]),
      fecha_estreno: new FormControl('', Validators.required),
      estado: new FormControl('', Validators.required),
      clasificacion: new FormControl('', Validators.required),
      imagen: new FormControl('', Validators.required),
      id_distribuidor: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.initializeFilteredArrays();
  }

  initializeFilteredArrays(): void {
    this.filteredIdiomas = [...this.idiomas];
    this.filteredGeneros = [...this.generos];
    this.filteredActores = [...this.actores];
    this.filteredEtiquetas = [...this.etiquetas];
    this.filteredDistribuidores = [...this.distribuidor];
    
    // Aplicar filtros iniciales para excluir elementos ya seleccionados
    this.initializeIdiomasFilter();
    this.initializeGenerosFilter();
    this.initializeActoresFilter();
    this.initializeEtiquetasFilter();
    this.initializeDistribuidoresFilter();
  }

  removeGenre(genre: Generos): void {
    this.selectedGenres = this.selectedGenres.filter((g: Generos) => g !== genre);
    this.initializeGenerosFilter();
  }

  removeTag(tag: Etiquetas): void {
    this.selectedTags = this.selectedTags.filter((t: Etiquetas) => t !== tag);
    this.initializeEtiquetasFilter();
  }

  async onSubmit(): Promise<void> {
    if (!this.peliculaForm.valid) {
      this.peliculaForm.markAllAsTouched();
      this.alerta.error("Formulario Inválido", "Por favor complete todos los campos obligatorios");
      return;
    }
    
    if (
      this.selectedGenres.length === 0 ||
      this.selectedTags.length === 0 ||
      this.selectedIdiomas.length === 0 ||
      this.selectedActores.length === 0 ||
      !this.selectedDistribuidor
    ) {
      this.alerta.error("Formulario Inválido", "Por favor seleccione al menos un elemento de cada categoría");
      return;
    }

    if (!this.imagenSeleccionada) {
      this.alerta.error("Imagen requerida", "Por favor seleccione una imagen principal");
      return;
    }

    const pelicula: Pelicula = {
      ...this.peliculaForm.value,
      generos: this.selectedGenres.map(g => g.id_genero),
      etiquetas: this.selectedTags.map(t => t.id_etiqueta),
      idiomas: this.selectedIdiomas.map(i => i.id_idioma),
      actores: this.selectedActores.map(a => a.id_actor),
      id_distribuidor: this.selectedDistribuidor.id_distribuidora
    };

    try {
      const file = this.imagenSeleccionada;
      pelicula.imagen = await this.imgbbService.subirImagen(file);
      
      // Subir imágenes adicionales si existen
      if (this.imagenesAdicionales.length > 0) {
        const urlsImagenesAdicionales: { url: string }[] = await Promise.all(
          this.imagenesAdicionales.map(async (img) => {
            return { url: await this.imgbbService.subirImagen(img.file) };
          })
        );
        pelicula.img_carrusel = urlsImagenesAdicionales;
      } else {
        pelicula.img_carrusel = [];
      }

      this.peliculaService.addPelicula(pelicula)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.alerta.successRoute("Película creada", "La película se guardó correctamente", "peliculas/list");
          },
          error: (error) => {
            console.error('Error al guardar película:', error);
            this.alerta.error("Error", "Error al guardar la película");
          }
        });

    } catch (error) {
      console.error('Error en onSubmit:', error);
      this.alerta.error("Error", "Error al procesar las imágenes");
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.alerta.error("Archivo inválido", "Por favor seleccione una imagen válida");
        return;
      }
      
      // Validar tamaño (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB en bytes
      if (file.size > maxSize) {
        this.alerta.error("Archivo muy grande", "La imagen debe ser menor a 5MB");
        return;
      }
      
      this.imagenSeleccionada = file;
      this.peliculaForm.get('imagen')?.setValue(file.name);
      this.peliculaForm.get('imagen')?.markAsTouched();
      
      // Mostrar preview local
      const reader = new FileReader();
      reader.onload = () => this.imagenPreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  cargarDatos(): void {
    forkJoin({
      etiquetas: this.etiquetasService.getEtiquetas(),
      generos: this.generosService.getGeneros(),
      distribuidor: this.distribuidorService.getDistribuidor(),
      actores: this.actoresService.getActor(),
      idiomas: this.idiomaService.getIdiomas()
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.etiquetas = data.etiquetas;
        this.generos = data.generos;
        this.distribuidor = data.distribuidor;
        this.actores = data.actores;
        this.idiomas = data.idiomas;
        this.initializeFilteredArrays();
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        this.alerta.error('Error', 'No se pudieron cargar los datos necesarios');
      }
    });
  }

  reset(): void {
    this.peliculaForm.patchValue({
      etiquetas: '',
      generos: '',
      idiomas: '',
      actores: '',
    });
    
    // Limpiar arrays de selección
    this.selectedIdiomas = [];
    this.selectedGenres = [];
    this.selectedActores = [];
    this.selectedTags = [];
    this.selectedDistribuidor = null;
    
    // Reinicializar filtros
    this.initializeFilteredArrays();
  }

  onAdicionalImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0] && this.imagenesAdicionales.length < 5) {
      const file = input.files[0];

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.alerta.error("Archivo inválido", "Por favor seleccione una imagen válida");
        return;
      }
      
      // Validar tamaño (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB en bytes
      if (file.size > maxSize) {
        this.alerta.error("Archivo muy grande", "La imagen debe ser menor a 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          const nuevaImagen = {
            preview: e.target.result as string,
            file: file
          };
          this.imagenesAdicionales.push(nuevaImagen);

          // Ajustar el índice del carrusel si es necesario
          const totalSlides = this.getTotalSlides();
          if (this.currentSlideIndex > totalSlides - 2) {
            this.currentSlideIndex = Math.max(0, totalSlides - 2);
          }
        }
      };
      reader.readAsDataURL(file);

      // Limpiar input para permitir seleccionar la misma imagen
      input.value = '';
    } else if (this.imagenesAdicionales.length >= 5) {
      this.alerta.warning('Advertencia', 'Máximo de 5 imágenes alcanzado');
    }
  }

  removeImage(index: number): void {
    this.imagenesAdicionales.splice(index, 1);

    // Ajustar el índice del carrusel si es necesario
    const totalSlides = this.getTotalSlides();
    if (this.currentSlideIndex > totalSlides - 2) {
      this.currentSlideIndex = Math.max(0, totalSlides - 2);
    }
  }

  // Navegación del carrusel
  navigateCarousel(direction: number): void {
    const totalSlides = this.getTotalSlides();

    if (direction === -1 && this.canNavigateLeft()) {
      this.currentSlideIndex--;
    } else if (direction === 1 && this.canNavigateRight()) {
      this.currentSlideIndex++;
    }
  }

  // Obtener el número total de slides (imágenes + botón agregar si corresponde)
  getTotalSlides(): number {
    const imagesCount = this.imagenesAdicionales.length;
    const hasAddButton = imagesCount < 5 ? 1 : 0;
    return imagesCount + hasAddButton;
  }

  // Verificar si se puede navegar a la izquierda
  canNavigateLeft(): boolean {
    return this.currentSlideIndex > 0;
  }

  // Verificar si se puede navegar a la derecha
  canNavigateRight(): boolean {
    const totalSlides = this.getTotalSlides();
    return this.currentSlideIndex < totalSlides - 2; // -2 porque mostramos 2 slides a la vez
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Métodos de removeItem para quitar elementos seleccionados
  removeIdioma(idioma: Idiomas): void {
    this.selectedIdiomas = this.selectedIdiomas.filter(i => i.id_idioma !== idioma.id_idioma);
    this.initializeIdiomasFilter();
  }

  removeActor(actor: Actores): void {
    this.selectedActores = this.selectedActores.filter(a => a.id_actor !== actor.id_actor);
    this.initializeActoresFilter();
  }

  removeEtiqueta(etiqueta: Etiquetas): void {
    this.selectedTags = this.selectedTags.filter(t => t.id_etiqueta !== etiqueta.id_etiqueta);
    this.initializeEtiquetasFilter();
  }

  // Método para limpiar completamente el formulario
  clearForm(): void {
    this.peliculaForm.reset();
    this.selectedIdiomas = [];
    this.selectedGenres = [];
    this.selectedActores = [];
    this.selectedTags = [];
    this.selectedDistribuidor = null;
    this.imagenSeleccionada = null as any;
    this.imagenPreview = '';
    this.imagenesAdicionales = [];
    this.currentSlideIndex = 0;
    
    // Limpiar términos de búsqueda
    this.idiomasSearchTerm = '';
    this.generosSearchTerm = '';
    this.actoresSearchTerm = '';
    this.etiquetasSearchTerm = '';
    this.distribuidorSearchTerm = '';
    
    // Cerrar dropdowns
    this.showIdiomasDropdown = false;
    this.showGenerosDropdown = false;
    this.showActoresDropdown = false;
    this.showEtiquetasDropdown = false;
    this.showDistribuidorDropdown = false;
    
    // Reinicializar filtros
    this.initializeFilteredArrays();
  }

  // Método para validar si el formulario puede ser enviado
  canSubmit(): boolean {
    return this.peliculaForm.valid && 
           this.selectedGenres.length > 0 &&
           this.selectedTags.length > 0 &&
           this.selectedIdiomas.length > 0 &&
           this.selectedActores.length > 0 &&
           this.selectedDistribuidor !== null &&
           this.imagenSeleccionada !== null;
  }

  // Obtener el offset del carrusel para mostrar los slides correctos
  getCarouselOffset(): number {
    const slideWidth = 220; // Ancho de cada slide
    const gap = 15; // Gap entre slides
    return -(this.currentSlideIndex * (slideWidth + gap));
  }
}
