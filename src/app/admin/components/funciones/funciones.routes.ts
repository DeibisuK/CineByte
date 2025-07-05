import { Routes } from "@angular/router";
import { CrearFuncionesComponent } from "./crear-funciones/crear-funciones.component";
import { ListarFuncionesComponent } from "./listar-funciones/listar-funciones.component";
import { EditarFuncionesComponent } from "./editar-funciones/editar-funciones.component";
export const funcionesRoutes: Routes = [
  {
    path: 'add',
    component: CrearFuncionesComponent
  },
  {
    path: 'list',
    component: ListarFuncionesComponent
  },
  {
    path: 'editar/:id',
    component: EditarFuncionesComponent
  }
]