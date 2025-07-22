export interface AccesoContenido {
    id: number;
    usuario_id: string; // UUID - FK a auth.users
    artista_id: string; // UUID - FK a artistas
    contenido_id: number; // FK a contenido_exclusivo_artista
    tipo_acceso: 'membresia' | 'propina' | 'regalo' | 'promocional';
    membresia_usada?: number; // FK a membresias
    propina_usada?: number; // FK a propinas
    fecha_acceso: string; // timestamp
    fecha_expiracion?: string; // timestamp
    limites_uso?: {
        visualizaciones_maximas?: number;
        descargas_maximas?: number;
        tiempo_limite_minutos?: number;
    };
    metadata?: {
        dispositivo?: string;
        ubicacion?: string;
        ip_acceso?: string;
        user_agent?: string;
        timestamp?: string;
        transaccion_id?: number;
        metodo_pago?: string;
    };
    created_at: string;
}

// Interface para crear nuevo acceso
export interface NuevoAccesoContenido extends Omit<AccesoContenido, 'id' | 'fecha_acceso' | 'created_at'> {}

// Interface para validar acceso
export interface ValidacionAcceso {
    tiene_acceso: boolean;
    razon?: 'sin_membresia' | 'membresia_expirada' | 'propina_insuficiente' | 'limite_excedido' | 'contenido_inactivo';
    acceso_existente?: AccesoContenido;
    opciones_acceso?: {
        puede_comprar_individual: boolean;
        membresias_disponibles: number[];
        precio_individual?: number;
    };
}

// Interface para estadísticas de acceso
export interface EstadisticasAcceso {
    artista_id: string;
    contenido_id: number;
    total_accesos: number;
    accesos_por_membresia: number;
    accesos_por_propina: number;
    accesos_regalo: number;
    accesos_promocional: number;
    usuarios_unicos: number;
    fecha_primer_acceso?: string;
    fecha_ultimo_acceso?: string;
}
