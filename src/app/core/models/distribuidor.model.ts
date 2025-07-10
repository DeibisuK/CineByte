export interface Distribuidor {
  id_distribuidora?: number;
  nombre: string;
  ano_fundacion: number; // No permite null
  sitio_web: string | null;
  id_pais_origen: number; // No permite null
}