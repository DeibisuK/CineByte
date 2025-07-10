// Core Models - Barrel Export
export * from './actores.model';
export * from './anuncio.model';
export * from './distribuidor.model';
export * from './etiquetas.model';
export * from './funciones.model';
export * from './generos.model';
export * from './idiomas.model';
export * from './metodo-pago.model';
export * from './paises.model';
export * from './pelicula.model';
export * from './promocion.model';
export * from './users.model';

// Salas related models (exported separately to avoid conflicts)
export type { Sala, Espacio, Asiento } from './salas.model';
export type { 
  SedeSala, 
  Sede, 
  CreateSedeSalaRequest, 
  CreateMultipleSedeSalaRequest 
} from './sede_salas.model';
