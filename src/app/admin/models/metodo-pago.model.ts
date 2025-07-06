export interface MetodoPago {
    id_metodo_pago: number;
    firebase_uid: string;
    numero_tarjeta: string;
    fecha_expiracion: string;
    cvv: string;
    banco: string;
    tipo_tarjeta: string;
    fecha_creacion: string;
}

export interface MetodoPagoRequest {
    firebase_uid: string;
    numero_tarjeta: string;
    fecha_expiracion: string;
    cvv: string;
}

export interface MetodoPagoResponse {
    message: string;
    metodo: MetodoPago;
}
