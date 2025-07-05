import { Routes } from "@angular/router";
import { EtiquetasComponent } from "./etiquetas/etiquetas.component";
import { GenerosComponent } from "./generos/generos.component";
import { IdiomasComponent } from "./idiomas/idiomas.component";
import { CategoriasComponent } from "./categorias/categorias.component";

export const categoriasRoutes: Routes = [
  {
    path: '',
    component:CategoriasComponent
  }]