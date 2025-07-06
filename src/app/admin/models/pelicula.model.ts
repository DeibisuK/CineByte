export interface Pelicula {
    id_pelicula: number;
    titulo: string;
    descripcion: string;
    duracion_minutos : number; 
    fecha_estreno: Date;
    estado: string;
    id_distribuidor: number | string;
    generos:number[] | string[];
    etiquetas:number[] | string[];
    actores:number[] | string[];
    idiomas:number[] | string[];
    clasificacion: string;
    imagen: string;
    img_carrusel: { url: string }[];
};

export interface PeliculaEditar {
  id_pelicula: number;
  titulo: string;
  descripcion: string;
  duracion_minutos: number;
  fecha_estreno: Date;
  estado: string;
  clasificacion: string;
  imagen: string;
  id_distribuidor: number;
  generos: number[];
  etiquetas: number[];
  actores: number[];
  idiomas: number[];
  img_carrusel: { url: string }[];
}