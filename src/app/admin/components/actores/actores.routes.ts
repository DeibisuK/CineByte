import { Routes } from "@angular/router";
import { ListarActoresComponent } from "./listar-actores/listar-actores.component";
import { CrearActorComponent } from "./crear-actor/crear-actor.component";

export const actoresRoutes: Routes = [
  {
    path: 'add',
    component: CrearActorComponent
  },
  {
    path: 'list',
    component: ListarActoresComponent
  }
]