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
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-pelicula',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, CrearActorComponent,
    CrearDistribuidorComponent, RouterModule
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
  clasificaciones: string[] = ['G', 'PG', 'PG-13', 'R', 'NC-17'];
  imagenSeleccionada!: File;
  imagenPreview: string = '';
  mostrarModalActor = false;
  mostrarModalDistribuidor = false;

  imagenesAdicionales: { preview: string, file: File }[] = [];
  currentSlideIndex = 0;

  // Propiedades para el dropdown con buscador
  idiomaSearchTerm: string = '';
  generoSearchTerm: string = '';
  actorSearchTerm: string = '';
  etiquetaSearchTerm: string = '';
  distribuidorSearchTerm: string = '';

  // Arrays filtrados
  filteredIdiomas: Idiomas[] = [];
  filteredGeneros: Generos[] = [];
  filteredActores: Actores[] = [];
  filteredEtiquetas: Etiquetas[] = [];
  filteredDistribuidores: Distribuidor[] = [];

  // Estados de dropdown
  showIdiomasDropdown: boolean = false;
  showGenerosDropdown: boolean = false;
  showActoresDropdown: boolean = false;
  showEtiquetasDropdown: boolean = false;
  showDistribuidoresDropdown: boolean = false;

  // Estados de loading para dropdowns
  loadingIdiomas: boolean = false;
  loadingGeneros: boolean = false;
  loadingActores: boolean = false;
  loadingEtiquetas: boolean = false;
  loadingDistribuidores: boolean = false;

  @ViewChild('generosSelect') generosSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('etiquetasSelect') etiquetasSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('actoresSelect') actoresSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('idiomasSelect') idiomasSelect!: ElementRef<HTMLSelectElement>;

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
      duracion_minutos: new FormControl('', Validators.required),
      fecha_estreno: new FormControl('', Validators.required),
      estado: new FormControl('', Validators.required),
      clasificacion: new FormControl('', Validators.required),
      imagen: new FormControl('', Validators.required),
      id_distribuidor: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addGenre(genre: Generos) {
    if (genre && !this.selectedGenres.some(a => a.id_genero === genre.id_genero)) {
      this.selectedGenres.push(genre);
    }
    if (this.generosSelect?.nativeElement) {
      this.generosSelect.nativeElement.value = '';
    }
  }
  removeGenre(genre: Generos) {
    this.selectedGenres = this.selectedGenres.filter((g: Generos) => g !== genre);
  }

  addTag(tag: Etiquetas) {
    if (tag && !this.selectedTags.some(a => a.id_etiqueta === tag.id_etiqueta)) {
      this.selectedTags.push(tag);
    }
    if (this.etiquetasSelect?.nativeElement) {
      this.etiquetasSelect.nativeElement.value = '';
    }
  }
  removeTag(tag: Etiquetas) {
    this.selectedTags = this.selectedTags.filter((t: Etiquetas) => t !== tag);
  }

  addActor(actor: Actores) {
    if (actor && !this.selectedActores.some(a => a.id_actor === actor.id_actor)) {
      this.selectedActores.push(actor);
    }
    if (this.actoresSelect?.nativeElement) {
      this.actoresSelect.nativeElement.value = '';
    }
  }
  removeActor(actor: Actores) {
    this.selectedActores = this.selectedActores.filter((a: Actores) => a !== actor);
  }

  addIdioma(idioma: Idiomas) {
    if (idioma && !this.selectedIdiomas.some(a => a.id_idioma === idioma.id_idioma)) {
      this.selectedIdiomas.push(idioma);
    }
    if (this.idiomasSelect?.nativeElement) {
      this.idiomasSelect.nativeElement.value = '';
    }
  }
  removeIdioma(idioma: Idiomas) {
    this.selectedIdiomas = this.selectedIdiomas.filter((a: Idiomas) => a !== idioma);
  }

  async onSubmit() {
    if (!this.peliculaForm.valid) {
      this.alerta.error("Formulario Inválido", "Rellene todos los campos");
      return;
    }
    if (
      this.selectedGenres.length === 0 ||
      this.selectedTags.length === 0 ||
      this.selectedIdiomas.length === 0 ||
      this.selectedActores.length === 0
    ) {
      this.alerta.error("Formulario Inválido", "Rellene todos los campos");
      return;
    }

    // Mostrar SweetAlert de carga para subida de imágenes
    Swal.fire({
      title: 'Subiendo imágenes...',
      text: 'Por favor espera mientras se suben las imágenes',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const pelicula: Pelicula = {
      ...this.peliculaForm.value,
      generos: this.selectedGenres.map(g => g.id_genero),
      etiquetas: this.selectedTags.map(t => t.id_etiqueta),
      idiomas: this.selectedIdiomas.map(i => i.id_idioma),
      actores: this.selectedActores.map(a => a.id_actor),
      id_distribuidor: Number(this.peliculaForm.value.id_distribuidor)
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

      // Cerrar el SweetAlert de carga
      Swal.close();

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
      Swal.close(); // Cerrar SweetAlert en caso de error
      this.alerta.error("Error", "Error al guardar la película");
    }
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.imagenSeleccionada = file;
      this.peliculaForm.get('imagen')?.setValue(file.name); // O file si necesitas el archivo completo
      this.peliculaForm.get('imagen')?.markAsTouched();
      // Opcional: mostrar preview local
      const reader = new FileReader();
      reader.onload = () => this.imagenPreview = reader.result as string;
      reader.readAsDataURL(file);

    }
  }

  // Métodos para filtrar
  filterIdiomas(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredIdiomas = this.idiomas.filter(idioma =>
      idioma.nombre.toLowerCase().includes(searchTerm)
    );
  }

  filterGeneros(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredGeneros = this.generos.filter(genero =>
      genero.nombre.toLowerCase().includes(searchTerm)
    );
  }

  filterActores(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredActores = this.actores.filter(actor =>
      actor.nombre.toLowerCase().includes(searchTerm)
    );
  }

  filterEtiquetas(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredEtiquetas = this.etiquetas.filter(etiqueta =>
      etiqueta.nombre.toLowerCase().includes(searchTerm)
    );
  }

  filterDistribuidores(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredDistribuidores = this.distribuidor.filter(distribuidor =>
      distribuidor.nombre.toLowerCase().includes(searchTerm)
    );
  }

  // Métodos para seleccionar
  selectIdioma(idioma: Idiomas): void {
    this.addIdioma(idioma);
    this.idiomaSearchTerm = '';
    this.showIdiomasDropdown = false;
  }

  selectGenero(genero: Generos): void {
    this.addGenre(genero);
    this.generoSearchTerm = '';
    this.showGenerosDropdown = false;
  }

  selectActor(actor: Actores): void {
    this.addActor(actor);
    this.actorSearchTerm = '';
    this.showActoresDropdown = false;
  }

  selectEtiqueta(etiqueta: Etiquetas): void {
    this.addTag(etiqueta);
    this.etiquetaSearchTerm = '';
    this.showEtiquetasDropdown = false;
  }

  selectDistribuidor(distribuidor: Distribuidor): void {
    this.peliculaForm.get('id_distribuidor')?.setValue(distribuidor.id_distribuidora);
    this.distribuidorSearchTerm = distribuidor.nombre;
    this.showDistribuidoresDropdown = false;
  }

  // Métodos para toggle dropdown
  toggleIdiomasDropdown(): void {
    this.showIdiomasDropdown = !this.showIdiomasDropdown;
    if (this.showIdiomasDropdown) {
      this.filteredIdiomas = [...this.idiomas];
    }
    this.updateDropdownClass('idiomas');
  }

  toggleGenerosDropdown(): void {
    this.showGenerosDropdown = !this.showGenerosDropdown;
    if (this.showGenerosDropdown) {
      this.filteredGeneros = [...this.generos];
    }
    this.updateDropdownClass('generos');
  }

  toggleActoresDropdown(): void {
    this.showActoresDropdown = !this.showActoresDropdown;
    if (this.showActoresDropdown) {
      this.filteredActores = [...this.actores];
    }
    this.updateDropdownClass('actores');
  }

  toggleEtiquetasDropdown(): void {
    this.showEtiquetasDropdown = !this.showEtiquetasDropdown;
    if (this.showEtiquetasDropdown) {
      this.filteredEtiquetas = [...this.etiquetas];
    }
    this.updateDropdownClass('etiquetas');
  }

  toggleDistribuidoresDropdown(): void {
    this.showDistribuidoresDropdown = !this.showDistribuidoresDropdown;
    if (this.showDistribuidoresDropdown) {
      this.filteredDistribuidores = [...this.distribuidor];
    }
    this.updateDropdownClass('distribuidores');
  }

  // Método para actualizar clases CSS dinámicamente
  private updateDropdownClass(type: string): void {
    const dropdownElement = document.querySelector(`.dropdown-container.${type}`);
    if (dropdownElement) {
      if (this.getDropdownState(type)) {
        dropdownElement.classList.add('active');
      } else {
        dropdownElement.classList.remove('active');
      }
    }
  }

  // Método auxiliar para obtener estado de dropdown
  private getDropdownState(type: string): boolean {
    switch (type) {
      case 'idiomas': return this.showIdiomasDropdown;
      case 'generos': return this.showGenerosDropdown;
      case 'actores': return this.showActoresDropdown;
      case 'etiquetas': return this.showEtiquetasDropdown;
      case 'distribuidores': return this.showDistribuidoresDropdown;
      default: return false;
    }
  }

  // Métodos para ocultar dropdown
  hideIdiomasDropdown(): void {
    setTimeout(() => this.showIdiomasDropdown = false, 200);
    this.filteredIdiomas = [...this.idiomas];
  }

  hideGenerosDropdown(): void {
    setTimeout(() => this.showGenerosDropdown = false, 200);
    this.filteredGeneros = [...this.generos];
  }

  hideActoresDropdown(): void {
    setTimeout(() => this.showActoresDropdown = false, 200);
    this.filteredActores = [...this.actores];
  }

  hideEtiquetasDropdown(): void {
    setTimeout(() => this.showEtiquetasDropdown = false, 200);
    this.filteredEtiquetas = [...this.etiquetas];
  }

  hideDistribuidoresDropdown(): void {
    setTimeout(() => this.showDistribuidoresDropdown = false, 200);
    this.filteredDistribuidores = [...this.distribuidor];
  }

  cargarDatos() {
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

        // Inicializar arrays filtrados
        this.filteredEtiquetas = [...this.etiquetas];
        this.filteredGeneros = [...this.generos];
        this.filteredDistribuidores = [...this.distribuidor];
        this.filteredActores = [...this.actores];
        this.filteredIdiomas = [...this.idiomas];
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        this.alerta.error('Error', 'No se pudieron cargar los datos necesarios');
      }
    });
  }

  reset() {
    this.peliculaForm.patchValue({
      etiquetas: '',
      generos: '',
      idiomas: '',
      actores: '',
    });
  }

  onAdicionalImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0] && this.imagenesAdicionales.length < 5) {
      const file = input.files[0];

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const nuevaImagen = {
          preview: e.target.result,
          file: file
        };
        this.imagenesAdicionales.push(nuevaImagen);

        // Ajustar el índice del carrusel si es necesario
        const totalSlides = this.getTotalSlides();
        if (this.currentSlideIndex > totalSlides - 2) {
          this.currentSlideIndex = Math.max(0, totalSlides - 2);
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

  // Obtener el offset del carrusel para mostrar los slides correctos
  getCarouselOffset(): number {
    const slideWidth = 220; // Ancho de cada slide
    const gap = 15; // Gap entre slides
    return -(this.currentSlideIndex * (slideWidth + gap));
  }
}

