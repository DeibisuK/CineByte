import { Routes } from "@angular/router";
import { EditSalasComponent } from "./edit-salas/edit-salas.component";
import { CrearSalasComponent } from "./crear-salas/crear-salas.component";
import { ListSalasComponent } from "./list-salas/list-salas.component";

export const salasRoutes: Routes = [
  {
    path: 'add',
    component: CrearSalasComponent
  },
  {
    path: 'list',
    component: ListSalasComponent
  },
  {
    path: 'editar/:id',
    component: EditSalasComponent
  }
]