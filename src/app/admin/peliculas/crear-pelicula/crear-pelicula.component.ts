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
  constructor() {
    this.peliculaForm = new FormGroup({
      id:  new FormControl('', Validators.required),
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

}
