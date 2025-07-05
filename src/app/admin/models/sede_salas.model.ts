export interface SedeSala {
  id_sede_sala: number;
  id_sede: number;
  id_sala: number;
  nombre: string;
  estado: 'Disponible' | 'Mantenimiento' | 'Pendiente' | 'Deshabilitado';
  nombre_sede?: string;
  direccion_sede?: string;
  nombre_sala?: string;
  cantidad_asientos?: number;
  tipo_sala?: string;
}

export interface Sede {
  id_sede: number;
  nombre: string;
  direccion: string;
  ciudad?: string;
  telefono?: string;
  email?: string;
  estado: string;
  latitud?: number;
  longitud?: number;
}

export interface Sala {
  id_sala: number;
  nombre: string;
  cantidad_asientos: number;
  tipo_sala: string;
  estado: string;
}

export interface CreateSedeSalaRequest {
  id_sede: number;
  id_sala: number;
  nombre: string;
  estado: 'Disponible' | 'Mantenimiento' | 'Pendiente' | 'Deshabilitado';
}

export interface CreateMultipleSedeSalaRequest {
  sedes_salas: CreateSedeSalaRequest[];
}
