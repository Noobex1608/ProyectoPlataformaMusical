// src/app/models/suscripcion.model.ts
export interface Suscripcion {
    id: number;
    usuarioId: number; // FK a usuarios (fan)
    membresiaId: number; // FK a membresias
    artistaId: string; // FK a artistas para facilitar consultas
    fechaInicio: Date;
    fechaFin: Date;
    activa: boolean;
    renovacionAutomatica: boolean;
    estadoPago: 'pendiente' | 'pagado' | 'cancelado' | 'vencido';
    metodoPago?: string;
    montoTotal: number;
    montoComision: number;
    montoNeto: number;
    transaccionId?: string; // ID de transacción del procesador de pagos
    fechaCancelacion?: Date;
    motivoCancelacion?: string;
    beneficiosUsados: {
        fotosExclusivas: number;
        avancesCanciones: number;
        mensajesPrivados: number;
    };
}

// Interfaz para el modelo de base de datos (Supabase)
export interface SuscripcionUsuario {
    id: string;
    usuario_id: string;
    membresia_id: string;
    artista_id: string;
    fecha_inicio: string;
    fecha_fin: string;
    activa: boolean;
    renovacion_automatica: boolean;
    estado_pago: string;
    metodo_pago?: string;
    monto_total: number;
    monto_comision: number;
    monto_neto: number;
    transaccion_id?: string;
    fecha_cancelacion?: string;
    motivo_cancelacion?: string;
    beneficios_usados?: {
        fotos_exclusivas: number;
        avances_canciones: number;
        mensajes_privados: number;
    };
}

// Interfaz para suscripciones con detalles completos (para el componente)
export interface SuscripcionConDetalles extends Suscripcion {
    artista: {
        id: string;
        nombre: string;
        imagen_perfil?: string;
    };
    plan: {
        id: number;
        nombre: string;
        precio: number;
        descripcion?: string;
        beneficios: string[];
    };
}

// Interfaz para resumen de suscripciones
export interface ResumenSuscripciones {
    total: number;
    activas: number;
    inactivas: number;
    gastoMensual: number;
}