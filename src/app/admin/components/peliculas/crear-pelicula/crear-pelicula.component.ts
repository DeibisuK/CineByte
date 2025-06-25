import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Pelicula } from '../../../models/pelicula.model';
import { PeliculaService } from '../../../../services/pelicula.service';
import { GenerosService } from '../../../../services/generos.service';
import { EtiquetasService } from '../../../../services/etiquetas.service';
import { ImgbbService } from '../../../../services/imgbb.service';
import Swal from 'sweetalert2'
@Component({
  selector: 'app-crear-pelicula',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './crear-pelicula.component.html',
  styleUrl: './crear-pelicula.component.css'
})
export class CrearPeliculaComponent {

  peliculaForm: FormGroup;
  generos: string[] = [];
  etiquetas: string[] = [];
  clasificaciones: string[] = ['G', 'PG', 'PG-13', 'R', 'NC-17'];
  imagenSeleccionada!: File;
  imagenPreview: string = '';
  selectedGenres: string[] = [];
  selectedTags: string[] = [];

  addGenre(genre: string) {
    if (genre && !this.selectedGenres.includes(genre)) {
      this.selectedGenres.push(genre);
      const generosInput = document.getElementById('generos') as HTMLInputElement | null;
      if (generosInput) {
        generosInput.value = '';
      }
    }
  }
  removeGenre(genre: string) {
    this.selectedGenres = this.selectedGenres.filter((g: string) => g !== genre);
  }

  addTag(tag: string) {
    if (tag && !this.selectedTags.includes(tag)) {
      this.selectedTags.push(tag);
      const etiquetasInput = document.getElementById('etiquetas') as HTMLInputElement | null;
      if (etiquetasInput) {
        etiquetasInput.value = '';
      }
    }
    
  }
  removeTag(tag:string) {
    
    this.selectedTags = this.selectedTags.filter((t: string) => t !== tag);
    console.log(this.selectedTags[0])
  }

  constructor(private peliculaService: PeliculaService, private generosService: GenerosService,
    private etiquetasService: EtiquetasService, private imgbbService: ImgbbService) {
    this.etiquetasService.getEtiquetas().subscribe(data => {
      this.etiquetas = data.map((e: any) => e.nombre);
    });

    this.generosService.getGeneros().subscribe(data => {
      this.generos = data.map((e: any) => e.nombre);
    });

    this.peliculaForm = new FormGroup({
      titulo: new FormControl('', Validators.required),
      descripcion: new FormControl('', Validators.required),
      duracion_minutos: new FormControl('', Validators.required),
      fecha_estreno: new FormControl('', Validators.required),
      generos: new FormControl('', Validators.required),
      estado: new FormControl('', Validators.required),
      etiquetas:  new FormControl('', Validators.required),
      clasificacion: new FormControl('', Validators.required),
      imagen: new FormControl('', Validators.required)
    });

  }

  async onSubmit() {
    if (this.peliculaForm.valid) {
      const pelicula: Pelicula = this.peliculaForm.value as Pelicula;
      const file = this.imagenSeleccionada;
      if (!file) {
        alert('Debes seleccionar una imagen.');
        return;
      }
      try {
        const url = await this.imgbbService.subirImagen(file);
        pelicula.imagen = url;
        this.peliculaService.guardarPelicula(pelicula);
        Swal.fire({
          title: "Pelicula guardada",
          text: "La película se ha guardado correctamente.",
          icon: "success"
        });

      } catch (error) {
        console.error('Error al subir imagen o guardar película:', error);
        alert('Hubo un error al guardar la película.');
      }

    } else {
      console.log('Formulario inválido', this.peliculaForm.value);
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
