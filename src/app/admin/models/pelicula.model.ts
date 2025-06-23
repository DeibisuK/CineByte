export interface Pelicula {
    id_pelicula: number;
    titulo: string;
    descripcion: string;
    duracion_minutos : number; 
    fecha_estreno: Date;
    estado: string;
    clasificacion: string;
    imagen: string;
};