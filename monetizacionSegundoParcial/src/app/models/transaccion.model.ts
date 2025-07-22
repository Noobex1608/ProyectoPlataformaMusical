export interface Transaccion {
    id: number;
    usuario_id: string; // UUID de auth.users
    artista_id: string; // FK a artistas UUID
    tipo: 'membresia' | 'propina' | 'recompensa' | 'contenido_exclusivo' | 'evento';
    subtipo?: string; // para mayor granularidad
    referencia_id: number; // ID del objeto relacionado (membresiaId, propinaId, etc.)
    descripcion: string;
    concepto: string; // descripción breve para el usuario
    monto: number; // monto total
    monto_comision: number; // comisión de la plataforma
    monto_neto: number; // monto que recibe el artista
    moneda: string; // 'USD', 'EUR', etc.
    fecha: string; // timestamp
    fecha_procesamiento?: string; // timestamp
    estado: 'pendiente' | 'procesada' | 'cancelada' | 'reembolsada' | 'fallida';
    metodo_pago: string; // 'tarjeta', 'paypal', 'stripe', etc.
    transaccion_externa_id?: string; // ID de la transacción en el procesador
    metadata?: any; // JSON con IP, dispositivo, ubicación, notas
    created_at: string;
}

// Interface para compatibilidad con código anterior
export interface TransaccionLegacy {
    id: number;
    usuarioId: number; // Mapea a usuario_id
    artistaId: string; // Mapea a artista_id
    tipo: 'membresia' | 'propina' | 'recompensa' | 'contenido_exclusivo' | 'evento';
    subtipo?: string;
    referenciaId: number; // Mapea a referencia_id
    descripcion: string;
    concepto: string;
    monto: number;
    montoComision: number; // Mapea a monto_comision
    montoNeto: number; // Mapea a monto_neto
    moneda: string;
    fecha: Date; // Mapea a fecha
    fechaProcesamiento?: Date; // Mapea a fecha_procesamiento
    estado: 'pendiente' | 'procesada' | 'cancelada' | 'reembolsada' | 'fallida';
    metodoPago: string; // Mapea a metodo_pago
    transaccionExternaId?: string; // Mapea a transaccion_externa_id
    metadata?: {
        ip?: string;
        dispositivo?: string;
        ubicacion?: string;
        notas?: string;
    };
    usuario?: any; // mantener si es necesario
}
