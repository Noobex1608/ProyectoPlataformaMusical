export interface Propina {
    id: number;
    fan_id: string; // UUID de auth.users
    nombre_fan: string; // nombre del fan que envía la propina
    artista_id: string; // FK a artistas UUID
    cantidad: number; // cantidad de la propina
    monto: number; // mantener compatibilidad
    mensaje?: string;
    fecha: string; // timestamp
    cancion_dedicada?: number; // FK a canciones
    recompensa_desbloqueada?: number; // FK a recompensas
    estado: 'pendiente' | 'procesada' | 'rechazada';
    metodo_pago?: string; // 'tarjeta', 'paypal', 'cripto', etc.
    comision: number; // comisión de la plataforma
    monto_neto: number; // cantidad - comisión
    publico_en_feed: boolean; // si se muestra en el feed público
    created_at: string;
}

// Interface para compatibilidad con código anterior
export interface PropinaLegacy {
    id: number;
    fanId: number; // Mapea a fan_id
    nombreFan: string; // Mapea a nombre_fan
    artistaId: string; // Mapea a artista_id
    cantidad: number;
    monto: number;
    mensaje: string;
    fecha: Date; // Mapea a fecha
    cancionDedicada?: number; // Mapea a cancion_dedicada
    recompensaDesbloqueada?: number; // Mapea a recompensa_desbloqueada
    estado: 'pendiente' | 'procesada' | 'rechazada';
    metodoPago?: string; // Mapea a metodo_pago
    comision: number;
    montoNeto: number; // Mapea a monto_neto
    publicoEnFeed: boolean; // Mapea a publico_en_feed
}
    