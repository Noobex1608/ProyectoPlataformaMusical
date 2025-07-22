export interface Recompensa {
    id: number;
    artista_id: string; // FK a artistas UUID
    nombre: string;
    descripcion?: string;
    precio: number;
    cantidad_disponible?: number;
    cantidad_vendida: number;
    tipo: 'digital' | 'fisica' | 'experiencia' | 'contenido_exclusivo';
    imagen_url?: string;
    activa: boolean;
    fecha_limite?: string; // date
    requisitos?: any; // JSON requisitos para acceder
    contenido_digital?: any; // JSON para recompensas digitales
    created_at: string;
    updated_at: string;
}

// Interface para compatibilidad con código anterior
export interface RecompensaLegacy {
    id: number;
    nombre: string;
    descripcion: string;
    tipo: string;
    valorMinimo: number; // Mapea a precio
    puntos: number; // Podría mapearse a algún campo personalizado
}