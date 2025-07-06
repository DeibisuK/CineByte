import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Pelicula, PeliculaEditar } from '../../../models/pelicula.model';
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
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AlertaService } from '../../../../services/alerta.service';
import { CrearActorComponent } from "../../actores/crear-actor/crear-actor.component";
import { CrearDistribuidorComponent } from '../../distribuidor/crear-distribuidor/crear-distribuidor.component';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-modificar-pelicula',
  imports: [ReactiveFormsModule, CommonModule, CrearActorComponent,
    CrearDistribuidorComponent,RouterModule
  ],
  templateUrl: './modificar-pelicula.component.html',
  styleUrl: './modificar-pelicula.component.css'
})
export class ModificarPeliculaComponent implements OnInit, OnDestroy {
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

  peliculaId!: number;
  peliculaActual!: Pelicula;

  imagenesAdicionales: { preview: string, file: File | null }[] = [];
  currentSlideIndex = 0;

  @ViewChild('generosSelect') generosSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('etiquetasSelect') etiquetasSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('actoresSelect') actoresSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('idiomasSelect') idiomasSelect!: ElementRef<HTMLSelectElement>;

  constructor(
    private peliculaService: PeliculaService,
    private generosService: GenerosService,
    private etiquetasService: EtiquetasService,
    private distribuidorService: DistribuidorService,
    private actoresService: ActoresService,
    private router: Router,
    private route: ActivatedRoute, // Para obtener el ID de la URL
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

  ngOnInit() {
    this.peliculaId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarDatos();
    this.cargarPelicula();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarPelicula() {
    this.peliculaService.getPeliculaById(this.peliculaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pelicula) => {
          this.peliculaActual = pelicula;
          this.cargarDatosRelacionados().then(() => {
            const peliculaEditar = this.peliculaActual as PeliculaEditar;
            this.llenarFormulario(peliculaEditar);
          });
        },
        error: (error) => {
          console.error('Error al cargar la película:', error);
          this.alerta.error('Error', 'No se pudo cargar la película');
          this.router.navigate(['/admin/peliculas/list']);
        }
      });
  }

  private cargarDatosRelacionados(): Promise<void> {
    const etiquetas$ = this.peliculaService.getEtiquetasByPeliculaId(this.peliculaId);
    const generos$ = this.peliculaService.getGenerosByPeliculaId(this.peliculaId);
    const actores$ = this.peliculaService.getActoresByPeliculaId(this.peliculaId);
    const idiomas$ = this.peliculaService.getIdiomasByPeliculaId(this.peliculaId);

    return forkJoin({
      etiquetas: etiquetas$,
      generos: generos$,
      actores: actores$,
      idiomas: idiomas$
    }).pipe(
      takeUntil(this.destroy$)
    ).toPromise().then((result) => {
      if (result) {
        this.peliculaActual.etiquetas = result.etiquetas || [];
        this.peliculaActual.generos = result.generos || [];
        this.peliculaActual.actores = result.actores || [];
        this.peliculaActual.idiomas = result.idiomas || [];
      }
    }).catch((error) => {
      console.error('Error al cargar datos relacionados:', error);
      this.alerta.error('Error', 'No se pudieron cargar todos los datos de la película');
      return Promise.resolve();
    });
  }

  llenarFormulario(pelicula: PeliculaEditar) {
    // Convertir fecha a formato yyyy-MM-dd
    const fechaEstreno = pelicula.fecha_estreno ? new Date(pelicula.fecha_estreno).toISOString().split('T')[0] : '';

    this.peliculaForm.patchValue({
      titulo: pelicula.titulo,
      descripcion: pelicula.descripcion,
      duracion_minutos: pelicula.duracion_minutos,
      fecha_estreno: fechaEstreno,
      estado: pelicula.estado,
      clasificacion: pelicula.clasificacion,
      imagen: pelicula.imagen,
      id_distribuidor: pelicula.id_distribuidor
    });

    this.imagenPreview = pelicula.imagen || '';

    if (pelicula.img_carrusel && Array.isArray(pelicula.img_carrusel)) {
      this.imagenesAdicionales = pelicula.img_carrusel.map((img: any) => ({
        preview: img.url,
        file: null
      }));
    }

    // Cargar los elementos seleccionados basados en los IDs
    if (pelicula.generos && pelicula.generos.length > 0) {
      this.selectedGenres = this.generos.filter(genero =>
        pelicula.generos.includes(genero.id_genero)
      );
    }

    if (pelicula.etiquetas && pelicula.etiquetas.length > 0) {
      this.selectedTags = this.etiquetas.filter(etiqueta =>
        pelicula.etiquetas.includes(etiqueta.id_etiqueta)
      );
    }

    if (pelicula.actores && pelicula.actores.length > 0) {
      this.selectedActores = this.actores.filter(actor =>
        pelicula.actores.includes(actor.id_actor)
      );
    }

    if (pelicula.idiomas && pelicula.idiomas.length > 0) {
      this.selectedIdiomas = this.idiomas.filter(idioma =>
        pelicula.idiomas.includes(idioma.id_idioma)
      );
    }
  }

  async onSubmit() {
    if (!this.peliculaForm.valid || this.selectedGenres.length === 0 || this.selectedTags.length === 0 ||
      this.selectedIdiomas.length === 0 || this.selectedActores.length === 0) {
      this.alerta.error("Formulario Inválido", "Rellene todos los campos");
      return;
    }

    const pelicula: Pelicula = {
      id_pelicula: this.peliculaId,
      ...this.peliculaForm.value,
      generos: this.selectedGenres.map(g => g.id_genero),
      etiquetas: this.selectedTags.map(t => t.id_etiqueta),
      idiomas: this.selectedIdiomas.map(i => i.id_idioma),
      actores: this.selectedActores.map(a => a.id_actor),
      id_distribuidor: Number(this.peliculaForm.value.id_distribuidor)
    };

    try {
      // Subir imagen principal si fue modificada
      if (this.imagenSeleccionada) {
        pelicula.imagen = await this.imgbbService.subirImagen(this.imagenSeleccionada);
      }

      // Subir solo las imágenes nuevas del carrusel
      const imagenesCarruselFinal: { url: string }[] = [];

      for (const imagen of this.imagenesAdicionales) {
        if (imagen.file) {
          const url = await this.imgbbService.subirImagen(imagen.file);
          imagenesCarruselFinal.push({ url });
        } else {
          imagenesCarruselFinal.push({ url: imagen.preview });
        }
      }

      pelicula.img_carrusel = imagenesCarruselFinal;

      this.peliculaService.updatePelicula(pelicula)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.alerta.successRoute("Película actualizada", "La película se actualizó correctamente", "peliculas/list");
          },
          error: (error) => {
            console.error('Error al actualizar película:', error);
            this.alerta.error("Error", "Error al actualizar la película");
          }
        });

    } catch (error) {
      console.error('Error en onSubmit:', error);
      this.alerta.error("Error", "Error al actualizar la película");
    }
  }

  // Métodos copiados del crear-pelicula (sin cambios)
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

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.imagenSeleccionada = file;
      this.peliculaForm.get('imagen')?.setValue(file.name);
      this.peliculaForm.get('imagen')?.markAsTouched();

      const reader = new FileReader();
      reader.onload = () => this.imagenPreview = reader.result as string;
      reader.readAsDataURL(file);
    }
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
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        this.alerta.error('Error', 'No se pudieron cargar los datos necesarios');
      }
    });
  }

  onAdicionalImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0] && this.imagenesAdicionales.length < 5) {
      const file = input.files[0];

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenesAdicionales.push({
          preview: e.target.result,
          file: file
        });

        const totalSlides = this.getTotalSlides();
        if (this.currentSlideIndex > totalSlides - 2) {
          this.currentSlideIndex = Math.max(0, totalSlides - 2);
        }
      };
      reader.readAsDataURL(file);
      input.value = '';
    } else if (this.imagenesAdicionales.length >= 5) {
      this.alerta.warning('Advertencia', 'Máximo de 5 imágenes alcanzado');
    }
  }

  removeImage(index: number): void {
    this.imagenesAdicionales.splice(index, 1);
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