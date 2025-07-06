import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { Router } from '@angular/router';
import { AlertaService } from '../../../../services/alerta.service';
import { CrearActorComponent } from "../../actores/crear-actor/crear-actor.component";
import { CrearDistribuidorComponent } from '../../distribuidor/crear-distribuidor/crear-distribuidor.component';

@Component({
  selector: 'app-crear-pelicula',
  imports: [ReactiveFormsModule, CommonModule, CrearActorComponent, CrearActorComponent,
    CrearDistribuidorComponent
  ],
  templateUrl: './crear-pelicula.component.html',
  styleUrl: './crear-pelicula.component.css'
})
export class CrearPeliculaComponent {

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
  constructor(private peliculaService: PeliculaService, private generosService: GenerosService,
    private etiquetasService: EtiquetasService, private distribuidorService: DistribuidorService,
    private actoresService: ActoresService, private router: Router
    , private idiomaService: IdiomasService, private imgbbService: ImgbbService,
    private alerta: AlertaService) {
    this.cargarDatos();

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

  addGenre(genre: Generos) {
    if (genre && !this.selectedGenres.some(a => a.id_genero === genre.id_genero)) {
      this.selectedGenres.push(genre);
    }

    const select = document.getElementById('generos') as HTMLSelectElement | null;
    if (select) {
      select.value = '';
    }
  }
  removeGenre(genre: Generos) {
    this.selectedGenres = this.selectedGenres.filter((g: Generos) => g !== genre);
  }

  addTag(tag: Etiquetas) {
    if (tag && !this.selectedTags.some(a => a.id_etiqueta === tag.id_etiqueta)) {
      this.selectedTags.push(tag);
    }
    // Siempre resetea el select visualmente
    const select = document.getElementById('etiquetas') as HTMLSelectElement | null;
    if (select) {
      select.value = '';
    }
  }
  removeTag(tag: Etiquetas) {
    this.selectedTags = this.selectedTags.filter((t: Etiquetas) => t !== tag);
  }

  addActor(actor: Actores) {
    if (actor && !this.selectedActores.some(a => a.id_actor === actor.id_actor)) {
      this.selectedActores.push(actor);
    }
    const select = document.getElementById('actores') as HTMLSelectElement | null;
    if (select) {
      select.value = '';
    }
  }
  removeActor(actor: Actores) {
    this.selectedActores = this.selectedActores.filter((a: Actores) => a !== actor);
  }

  addIdioma(idioma: Idiomas) {
    if (idioma && !this.selectedIdiomas.some(a => a.id_idioma === idioma.id_idioma)) {
      this.selectedIdiomas.push(idioma);
    }
    // Siempre resetea el select visualmente
    const select = document.getElementById('idiomas') as HTMLSelectElement | null;
    if (select) {
      select.value = '';
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

    this.peliculaService.addPelicula(pelicula).subscribe({
        next: () => {
          this.alerta.successRoute("Película creada", "La película se guardó correctamente", "/peliculas/list");
        },
        error: () => {
          this.alerta.error("Error", "Error al guardar la pelicula");
        }
      });

    } catch (error) {
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

  cargarDatos() {
    this.etiquetasService.getEtiquetas().subscribe(data => {
      this.etiquetas = data;
    });
    this.generosService.getGeneros().subscribe(data => {
      this.generos = data;
    });
    this.distribuidorService.getDistribuidor().subscribe(data => {
      this.distribuidor = data;
    });
    this.actoresService.getActor().subscribe(data => {
      this.actores = data;
    });
    this.idiomaService.getIdiomas().subscribe(data => {
      this.idiomas = data;
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

  imagenesAdicionales: { preview: string, file: File }[] = [];

  // Carrusel fijo
  currentSlideIndex = 0;

  onAdicionalImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0] && this.imagenesAdicionales.length < 5) {
      const file = input.files[0];
      //console.log('Archivo seleccionado:', file.name);

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const nuevaImagen = {
          preview: e.target.result,
          file: file
        };
        this.imagenesAdicionales.push(nuevaImagen);
        //console.log('Imagen agregada. Total imágenes:', this.imagenesAdicionales.length);
        //console.log('Preview URL:', e.target.result.substring(0, 50) + '...');

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

    console.log('Imágenes adicionales:', this.imagenesAdicionales);
  }

  removeImage(index: number): void {
    console.log('Eliminando imagen en índice:', index);
    this.imagenesAdicionales.splice(index, 1);

    // Ajustar el índice del carrusel si es necesario
    const totalSlides = this.getTotalSlides();
    if (this.currentSlideIndex > totalSlides - 2) {
      this.currentSlideIndex = Math.max(0, totalSlides - 2);
    }

    console.log('Imágenes restantes:', this.imagenesAdicionales.length);
    console.log('Índice actual del carrusel:', this.currentSlideIndex);
  }

  // Navegación del carrusel
  navigateCarousel(direction: number): void {
    const totalSlides = this.getTotalSlides();

    if (direction === -1 && this.canNavigateLeft()) {
      this.currentSlideIndex--;
    } else if (direction === 1 && this.canNavigateRight()) {
      this.currentSlideIndex++;
    }

    console.log('Navegando carrusel, índice actual:', this.currentSlideIndex);
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

  scrollCarousel(direction: number): void {
    // Método legacy - redirigir a la nueva implementación
    this.navigateCarousel(direction);
  }
}
