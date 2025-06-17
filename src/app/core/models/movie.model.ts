export interface Movie {
  id: number;
  titulo: string;
  img: string;
  img_dsc?: string[];
  etiqueta: string[];
  descripcion: string;
  edad: number;
  duracion: string;
  idiomas: string[];
  generos: string[];
  trailer: string;
  precio: number;
  esEvento?: boolean;
  esEspecial?: boolean;
  proximamente?: boolean;
  enCartelera?: boolean;
  fechaEstreno?: Date;
}