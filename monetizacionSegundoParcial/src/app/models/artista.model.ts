export interface Artista {
    id: string; // UUID
    user_id: number; // FK a usuarios
    imagen?: string;
    nombre: string;
    genero?: string;
    pais?: string;
    descripcion?: string;
    token_verificacion?: string;
    created_at: string;
    updated_at: string;
}

export interface ArtistaConEstadisticas extends Artista {
    seguidores?: number;
    reproducciones?: number;
    likes?: number;
    precioMinimo?: number;
}

export interface PerfilArtista {
    id: number;
    artista_id: string;
    reproducciones: number;
    likes: number;
    seguidores: number;
    created_at: string;
    updated_at: string;
}
