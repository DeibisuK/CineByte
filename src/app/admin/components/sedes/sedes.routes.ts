import { Routes } from "@angular/router";
import { CrearSedesComponent } from "./crear-sedes/crear-sedes.component";
import { ListarSedesComponent } from "./listar-sedes/listar-sedes.component";
import { EditarSedesComponent } from "./editar-sedes/editar-sedes.component";
import { AsignSalasComponent } from "./asign-salas/asign-salas.component";

export const sedesRoutes: Routes = [
  {
    path: 'add',
    component: CrearSedesComponent
  },
  {
    path: 'list',
    component: ListarSedesComponent
  },
  {
    path: 'edit/:id',
    component: EditarSedesComponent
  },
  {
    path: 'asignar',
    component: AsignSalasComponent
  }
]