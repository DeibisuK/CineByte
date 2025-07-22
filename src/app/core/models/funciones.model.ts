export interface Funciones {
    id_funcion: number;
    id_pelicula: number;
    id_sala: number;
    fecha_hora_inicio: string;
    fecha_hora_fin: string;
    precio_funcion: number;
    id_idioma: number;
    trailer_url: string;
    estado: string;
}

export interface FuncionesList {
    id_funcion: number;
    id_pelicula: number; 
    titulo_pelicula: string; 
    id_sala: number;
    nombre_sala: string;
    fecha_hora_inicio: string;
    fecha_hora_fin: string;
    precio_funcion: number;
    id_idioma: number;
    idioma: string;
    trailer_url: string;
    estado: string;
}