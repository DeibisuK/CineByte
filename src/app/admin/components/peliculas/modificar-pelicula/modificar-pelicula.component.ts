import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { Router, ActivatedRoute } from '@angular/router';
import { AlertaService } from '../../../../services/alerta.service';
import { CrearActorComponent } from "../../actores/crear-actor/crear-actor.component";
import { CrearDistribuidorComponent } from '../../distribuidor/crear-distribuidor/crear-distribuidor.component';

@Component({
  selector: 'app-modificar-pelicula',
  imports: [ReactiveFormsModule, CommonModule, CrearActorComponent,
    CrearDistribuidorComponent
  ],
  templateUrl: './modificar-pelicula.component.html',
  styleUrl: './modificar-pelicula.component.css'
})
export class ModificarPeliculaComponent implements OnInit {

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

  cargarPelicula() {
    this.peliculaService.getPeliculaById(this.peliculaId).subscribe({
      next: async (pelicula) => {
        this.peliculaActual = pelicula;
        await this.cargarDatosAsync();
        const peliculaEditar = this.peliculaActual as unknown as PeliculaEditar;
        this.llenarFormulario(peliculaEditar);
      },
      error: () => {
        this.alerta.error('Error', 'No se pudo cargar la película');
        this.router.navigate(['/admin/peliculas/list']);
      }
    });
  }

  private cargarDatosAsync() {
    const etiquetas$ = this.peliculaService.getEtiquetasByPeliculaId(this.peliculaId);
    const generos$ = this.peliculaService.getGenerosByPeliculaId(this.peliculaId);
    const actores$ = this.peliculaService.getActoresByPeliculaId(this.peliculaId);
    const idiomas$ = this.peliculaService.getIdiomasByPeliculaId(this.peliculaId);

    return Promise.all([
      etiquetas$.toPromise(),
      generos$.toPromise(),
      actores$.toPromise(),
      idiomas$.toPromise()
    ]).then(([etiquetas, generos, actores, idiomas]) => {
      this.peliculaActual.etiquetas = etiquetas || [];
      this.peliculaActual.generos = generos || [];
      this.peliculaActual.actores = actores || [];
      this.peliculaActual.idiomas = idiomas || [];
    });
  }

  llenarFormulario(pelicula: PeliculaEditar) {
    // Convertir fecha a formato yyyy-MM-dd
    const fechaEstreno = pelicula.fecha_estreno ? new Date(pelicula.fecha_estreno).toISOString().split('T')[0] : '';

    // Llenar el formulario con los datos de la película
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

    // Configurar imagen preview
    this.imagenPreview = pelicula.imagen || '';

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
      id_pelicula: this.peliculaId,
      ...this.peliculaForm.value,
      generos: this.selectedGenres.map(g => g.id_genero),
      etiquetas: this.selectedTags.map(t => t.id_etiqueta),
      idiomas: this.selectedIdiomas.map(i => i.id_idioma),
      actores: this.selectedActores.map(a => a.id_actor),
      id_distribuidor: Number(this.peliculaForm.value.id_distribuidor)
    };

    try {
      // Si se seleccionó una nueva imagen, subirla
      if (this.imagenSeleccionada) {
        const file = this.imagenSeleccionada;
        pelicula.imagen = await this.imgbbService.subirImagen(file);
      }

      this.peliculaService.updatePelicula(pelicula).subscribe({
        next: () => {
          this.alerta.successRoute("Película actualizada", "La película se actualizó correctamente", "/admin/peliculas/list");
        },
        error: () => {
          this.alerta.error("Error", "Error al actualizar la película");
        }
      });
    } catch (error) {
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
    const select = document.getElementById('idiomas') as HTMLSelectElement | null;
    if (select) {
      select.value = '';
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
}