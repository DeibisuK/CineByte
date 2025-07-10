export interface Actores {
  id_actor: number;
  nombre: string;
  apellidos: string;
  fecha_nacimiento: Date | string;
  id_nacionalidad: number;
  fecha_registro?: Date | string;
  nombrePais?: string; // Propiedad opcional para el frontend
}

export interface ActorCreateDTO {
  nombre: string;
  apellidos: string;
  fecha_nacimiento: string;
  id_nacionalidad: number;
}

export interface ActorUpdateDTO {
  nombre?: string;
  apellidos?: string;
  fecha_nacimiento?: string;
  id_nacionalidad?: number;
}