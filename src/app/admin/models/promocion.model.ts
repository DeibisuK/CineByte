export interface Promocion {
  id_promo: number;
  imagen_url?: string;
  titulo: string;
  descripcion: string;
  tipo_promocion: 'Descuento' | 'Multiplicador' | 'Cupon';
  fecha_inicio: Date | string;
  fecha_fin: Date | string;
  url_link?: string;
  estado: 'Activo' | 'Inactivo' | 'Finalizado' | 'Pendiente';
  porcentaje_descuento?: number;
  nro_boletos?: number;
  codigo_cupon?: string;
  dia_valido?: 'Lunes' | 'Martes' | 'Miercoles' | 'Jueves' | 'Viernes' | 'Sabado' | 'Domingo' | 'Todos';
}