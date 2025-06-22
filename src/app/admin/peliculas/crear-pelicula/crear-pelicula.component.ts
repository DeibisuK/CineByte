import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Pelicula } from '../../models/pelicula.model';

@Component({
  selector: 'app-crear-pelicula',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './crear-pelicula.component.html',
  styleUrl: './crear-pelicula.component.css'
})
export class CrearPeliculaComponent {

  peliculaForm: FormGroup;
  generos: string[] = ['Acción', 'Comedia', 'Drama', 'Terror', 'Ciencia Ficción'];
  etiquetas: string[] = ['Clasico', 'Exclusivo', 'Estreno', '3D'];
  dropdownGenerosOpen = false;
  dropdownEtiquetasOpen = false;
  selectedGeneros: string[] = [];
  selectedEtiquetas: string[] = [];

  constructor() {
    this.peliculaForm = new FormGroup({
      id: new FormControl('', Validators.required),
      titulo: new FormControl('', Validators.required),
      descripcion: new FormControl('', Validators.required),
      duracion: new FormControl('', Validators.required),
      edad: new FormControl('', Validators.required),
      fechaEstreno: new FormControl('', Validators.required),
      imagen: new FormControl('', Validators.required),
      estado: new FormControl('', Validators.required)
    });
  }
  onSubmit() {
    if (this.peliculaForm.valid) {
      const pelicula: Pelicula = this.peliculaForm.value as Pelicula;
      // Aquí puedes manejar el envío del formulario
      console.log('Formulario enviado:', pelicula);
    } else {
      console.log('Formulario inválido');
    }
  }

  toggleDropdownGeneros() {
    this.dropdownGenerosOpen = !this.dropdownGenerosOpen;
    if (this.dropdownGenerosOpen) this.dropdownEtiquetasOpen = false;
  }
  toggleDropdownEtiquetas() {
    this.dropdownEtiquetasOpen = !this.dropdownEtiquetasOpen;
    if (this.dropdownEtiquetasOpen) this.dropdownGenerosOpen = false;
  }

  onGeneroChange(genero: string, event: any) {
    if (event.target.checked) {
      this.selectedGeneros.push(genero);
    } else {
      this.selectedGeneros = this.selectedGeneros.filter(g => g !== genero);
    }
    this.peliculaForm.get('genero')?.setValue(this.selectedGeneros);
  }
  onEtiquetaChange(etiqueta: string, event: any) {
    if (event.target.checked) {
      this.selectedEtiquetas.push(etiqueta);
    } else {
      this.selectedEtiquetas = this.selectedEtiquetas.filter(e => e !== etiqueta);
    }
    this.peliculaForm.get('etiquetas')?.setValue(this.selectedEtiquetas);
  }

  get generosInvalid() {
    const control = this.peliculaForm.get('genero');
    return control?.invalid && (control?.touched || control?.dirty);
  }
  get etiquetasInvalid() {
    const control = this.peliculaForm.get('etiquetas');
    return control?.invalid && (control?.touched || control?.dirty);
  }

}
