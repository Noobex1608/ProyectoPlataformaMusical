export interface Seguidor {
    id: number;
    follower_id: number; // FK a usuarios
    artista_id: string; // FK a artistas UUID
    followed_at: string;
}

export interface SeguimientoInfo {
    artista: {
        id: string;
        nombre: string;
        imagen?: string;
        genero?: string;
    };
    fecha_seguimiento: string;
    membresias_activas?: number;
    propinas_enviadas?: number;
}
