import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
import Swal from 'sweetalert2'
import { Router } from '@angular/router';
import { AlertaService } from '../../../../services/alerta.service';

@Component({
  selector: 'app-crear-pelicula',
  imports: [ReactiveFormsModule, CommonModule],
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

  constructor(private peliculaService: PeliculaService, private generosService: GenerosService,
    private etiquetasService: EtiquetasService, private distribuidorService: DistribuidorService,
    private actoresService: ActoresService, private router: Router
    , private idiomaService: IdiomasService, private imgbbService: ImgbbService,
    private alerta: AlertaService) {
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

    this.peliculaForm = new FormGroup({
      titulo: new FormControl('', Validators.required),
      descripcion: new FormControl('', Validators.required),
      duracion_minutos: new FormControl('', Validators.required),
      fecha_estreno: new FormControl('', Validators.required),
      estado: new FormControl('', Validators.required),
      generos: new FormControl('', Validators.required),
      etiquetas: new FormControl('', Validators.required),
      actores: new FormControl('', Validators.required),
      idiomas: new FormControl('', Validators.required),
      clasificacion: new FormControl('', Validators.required),
      imagen: new FormControl('', Validators.required),
      id_distribuidor: new FormControl('', Validators.required)
    });
  }

  addGenre(genre: Generos) {
    if (genre && !this.selectedGenres.includes(genre)) {
      this.selectedGenres.push(genre);
      const generosInput = document.getElementById('generos') as HTMLInputElement | null;
      if (generosInput) {
        generosInput.value = '';
      }
    }
    console.log(this.selectedGenres)
  }
  removeGenre(genre: Generos) {
    this.selectedGenres = this.selectedGenres.filter((g: Generos) => g !== genre);
  }

  addTag(tag: Etiquetas) {
    if (tag && !this.selectedTags.includes(tag)) {
      this.selectedTags.push(tag);
      const etiquetasInput = document.getElementById('etiquetas') as HTMLInputElement | null;
      if (etiquetasInput) {
        etiquetasInput.value = '';
      }
    }
  }
  removeTag(tag: Etiquetas) {
    this.selectedTags = this.selectedTags.filter((t: Etiquetas) => t !== tag);
  }

  addActor(actor: Actores) {
    if (actor && !this.selectedActores.includes(actor)) {
      this.selectedActores.push(actor);
      const actorInput = document.getElementById('actores') as HTMLInputElement | null;
      if (actorInput) {
        actorInput.value = '';
      }
    }
  }
  removeActor(actor: Actores) {
    this.selectedActores = this.selectedActores.filter((a: Actores) => a !== actor);
  }

  addIdioma(idioma: Idiomas) {
    if (idioma && !this.selectedIdiomas.includes(idioma)) {
      this.selectedIdiomas.push(idioma);
      const idiomaInput = document.getElementById('idiomas') as HTMLInputElement | null;
      if (idiomaInput) {
        idiomaInput.value = '';
      }
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

      this.peliculaService.guardarPelicula(pelicula);
      this.alerta.success("Película creada", "La película se guardó correctamente");
      this.peliculaForm.reset();
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
}
