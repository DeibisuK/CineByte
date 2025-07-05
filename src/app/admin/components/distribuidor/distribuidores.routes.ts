import { Routes } from "@angular/router";
import { CrearDistribuidorComponent } from "./crear-distribuidor/crear-distribuidor.component";
import { ListDistribuidorComponent } from "./listar-distribuidor/list-distribuidor.component";

export const distribuidoresRoutes: Routes = [
  {
    path: 'add',
    component: CrearDistribuidorComponent
  },
  {
    path: 'list',
    component: ListDistribuidorComponent
  }
]