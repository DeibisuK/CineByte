import { Routes } from "@angular/router";
import { CreatePromocionComponent } from "./crear-promociones/crear-promociones.component";
import { ListarPromocionesComponent } from "./listar-promociones/listar-promociones.component";
import { EditarPromocionComponent } from "./editar-promociones/editar-promociones.component";

export const promocionesRoutes: Routes = [
  {
    path: 'add',
    component: CreatePromocionComponent
  },
  {
    path: 'list',
    component: ListarPromocionesComponent
  },
  {
    path: 'editar/:id',
    component: EditarPromocionComponent
  }
]