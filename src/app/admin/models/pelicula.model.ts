export interface Pelicula {
    id_pelicula: number;
    titulo: string;
    descripcion: string;
    duracion_minutos : number; 
    fecha_estreno: Date;
    estado: string;
    generos:string[];
    etiquetas:string[];
    actores:string[];
    clasificacion: string;
    imagen: string;
    distribuidor: string;
};