export interface NotificacionMonetizacion {
    id: number;
    usuario_id: string; // UUID de auth.users
    artista_id?: string; // FK a artistas UUID
    tipo: 'nueva_membresia' | 'propina_recibida' | 'contenido_nuevo' | 'suscripcion_vencida' | 'recompensa_desbloqueada';
    titulo: string;
    mensaje: string;
    fecha_creacion: string;
    fecha_leida?: string;
    leida: boolean;
    accion?: any; // JSON con tipo, url, contenidoId
    prioridad: 'baja' | 'media' | 'alta';
    metadata?: any; // JSON con iconoUrl, imagenUrl, datos adicionales
    created_at: string;
}

// Interface para compatibilidad con código anterior
export interface NotificacionMonetizacionLegacy {
    id: number;
    usuarioId: number; // Mapea a usuario_id
    artistaId?: string; // Mapea a artista_id
    tipo: 'nueva_membresia' | 'propina_recibida' | 'contenido_nuevo' | 'suscripcion_vencida' | 'recompensa_desbloqueada';
    titulo: string;
    mensaje: string;
    fechaCreacion: Date; // Mapea a fecha_creacion
    fechaLeida?: Date; // Mapea a fecha_leida
    leida: boolean;
    accion?: {
        tipo: 'navegar' | 'descargar' | 'ver_contenido';
        url?: string;
        contenidoId?: number;
    };
    prioridad: 'baja' | 'media' | 'alta';
    metadata?: {
        iconoUrl?: string;
        imagenUrl?: string;
        datos?: any;
    };
}
