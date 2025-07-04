export interface Espacio {
  fila: string;      // Ej. 'A', 'B', 'C'
  columna: number;   // Ej. 1, 2, 3
}

export interface Sala {
  id_sala?: number;
  nombre: string;
  tipo_sala: string;
  cantidad_asientos: number; // Debe ser par
  espacios: Espacio[];       // Lista de asientos vacíos
  fecha_creacion?: Date;
}

export interface Asiento {
  id_asiento: number;
  id_sala: number;
  fila: string;
  columna: number;
  tipo: string;
  url_imagen: string | null;
}