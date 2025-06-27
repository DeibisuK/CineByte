import { Component } from '@angular/core';
import { Generos } from '../../../models/generos.model';
import { GenerosService } from '../../../../services/generos.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-generos',
  imports: [CommonModule,ReactiveFormsModule,MatFormFieldModule,MatInputModule,
    MatDividerModule,MatListModule,MatIconModule
  ],
  templateUrl: './generos.component.html',
  styleUrl: './generos.component.css'
})
export class GenerosComponent {
   generos: Generos[] = [];
  formGenero: FormGroup;

  constructor(private generoService: GenerosService) {
    this.formGenero = new FormGroup({
      nombre: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
    this.cargarGeneros();
  }

  cargarGeneros(): void {
    this.generoService.getGeneros().subscribe(generos => {
      this.generos = generos;
    });
  }

  crearGenero(): void {
    
  }

  eliminar(id: string): void {
  //  this.generosService.eliminar(id).subscribe(() => {
    //  this.cargarGeneros();
   // });
  }
}
