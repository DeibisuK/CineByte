// Modelos para el sistema de ventas - ACTUALIZADO con estructura real de BD
export interface Venta {
  id?: number;
  id_venta?: number; // Campo real de la BD
  firebase_uid: string;
  funcion_id: number;
  id_funcion?: number; // Campo real de la BD
  total_asientos: number;
  cantidad_boletos?: number; // Campo real de la BD
  subtotal: number;
  iva: number;
  total: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada';
  fecha_creacion?: Date;
  fecha_venta?: Date; // Campo real de la BD
  created_at?: Date; // Campo real de la BD
  fecha_actualizacion?: Date;
}

export interface VentaAsiento {
  id?: number;
  id_venta_asiento?: number; // Campo real de la BD
  venta_id: number;
  id_venta?: number; // Campo real de la BD
  numero_asiento: string;
  precio_asiento: number;
  precio_unitario?: number; // Campo real de la BD
  id_asiento?: number; // Campo real de la BD
  fecha_creacion?: Date;
}

export interface Pago {
  id?: number;
  id_pago?: number; // Campo real de la BD
  venta_id: number;
  id_venta?: number; // Campo real de la BD
  metodo_pago_id: number;
  id_metodo_pago?: number; // Campo real de la BD
  monto: number;
  estado: 'pendiente' | 'completado' | 'fallido';
  transaccion_id?: string;
  fecha_pago?: Date;
  fecha_creacion?: Date;
}

export interface Factura {
  id?: number;
  id_factura?: number; // Campo real de la BD
  venta_id: number;
  id_venta?: number; // Campo real de la BD
  numero_factura?: string;
  fecha_emision?: Date;
  cliente_nombre?: string; // Campo real de la BD
  cliente_email?: string; // Campo real de la BD
  cliente_telefono?: string; // Campo real de la BD
  pelicula_titulo?: string; // Campo real de la BD
  sala_nombre?: string; // Campo real de la BD
  fecha_funcion?: Date; // Campo real de la BD
  hora_inicio?: string; // Campo real de la BD
  hora_fin?: string; // Campo real de la BD
  idioma?: string; // Campo real de la BD
  subtotal: number;
  iva: number;
  iva_valor?: number; // Campo real de la BD
  total: number;
  estado: 'emitida' | 'anulada';
  fecha_creacion?: Date;
  created_at?: Date; // Campo real de la BD
}

export interface FacturaDetalle {
  id?: number;
  id_detalle?: number; // Campo real de la BD
  factura_id: number;
  id_factura?: number; // Campo real de la BD
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  asiento_fila?: string; // Campo real de la BD
  asiento_numero?: number; // Campo real de la BD
  fecha_creacion?: Date;
}

// DTOs para requests
export interface CreateVentaRequest {
  firebase_uid: string;
  funcion_id: number;
  asientos: CreateVentaAsientoRequest[];
  metodo_pago_id: number;
  transaccion_id?: string;
}

export interface CreateVentaAsientoRequest {
  numero_asiento: string;
  precio_asiento: number;
  id_asiento: number;
}

export interface VentaResponse {
  venta: Venta;
  asientos: VentaAsiento[];
  pago: Pago;
  factura: Factura;
  factura_detalles: FacturaDetalle[];
}

export interface VentaHistorialResponse {
  id: number;
  funcion_id: number;
  total_asientos: number;
  total: number;
  estado: string;
  fecha_creacion: Date;
  pelicula_titulo?: string;
  sala_nombre?: string;
  fecha_funcion?: Date;
  hora_funcion?: string;
  asientos: string[];
}

export interface VentaEstadisticasResponse {
  total_ventas: number;
  total_ingresos: number;
  total_asientos_vendidos: number;
  ventas_por_estado: {
    estado: string;
    cantidad: number;
    total: number;
  }[];
  ventas_por_pelicula: {
    pelicula_titulo: string;
    cantidad_ventas: number;
    total_ingresos: number;
    total_asientos: number;
  }[];
}
