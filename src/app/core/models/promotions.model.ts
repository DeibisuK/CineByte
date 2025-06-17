export interface Promotions {
  id: number;
  titulo: string;
  img: string;
  img_dsc?: string[];
  etiqueta: string[];
  descripcion: string;
  fechaInicio?: Date;
  fechaFin?: Date;
}