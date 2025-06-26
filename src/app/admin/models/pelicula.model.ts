export interface Pelicula {
    id_pelicula: number;
    titulo: string;
    descripcion: string;
    duracion_minutos : number; 
    fecha_estreno: Date;
    estado: string;
    id_distribuidor: number;
    generos:number[];
    etiquetas:number[];
    actores:number[];
    idiomas:number[];
    clasificacion: string;
    imagen: string;
};