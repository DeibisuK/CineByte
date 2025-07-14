import { Routes } from "@angular/router";
import { ListUsersComponent } from "./list-users/list-users.component";
import { AdminGuard } from "@core/guards/auth.guards";

export const usersRoutes: Routes = [
  {
    path: 'list',
    component: ListUsersComponent,
    canActivate: [AdminGuard],
    data: { roles: ['admin'] }
  }
]