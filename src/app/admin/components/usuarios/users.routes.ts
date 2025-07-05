import { Routes } from "@angular/router";
import { ListUsersComponent } from "./list-users/list-users.component";

export const usersRoutes: Routes = [
  {
    path: 'list',
    component: ListUsersComponent
  }
]