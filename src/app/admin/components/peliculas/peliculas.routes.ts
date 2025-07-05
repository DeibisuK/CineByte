import { Routes } from '@angular/router';
import { ListarPeliculaComponent } from './listar-pelicula/listar-pelicula.component';
import { CrearPeliculaComponent } from './crear-pelicula/crear-pelicula.component';
import { ModificarPeliculaComponent } from './modificar-pelicula/modificar-pelicula.component';

export const peliculasRoutes: Routes = [
    {
        path: 'add',
        component: CrearPeliculaComponent
    },
    {
        path: 'list',
        component: ListarPeliculaComponent
    },
    {
        path: 'edit/:id',
        component: ModificarPeliculaComponent
    }
]