// Modelo alineado con tabla contenido_exclusivo_artista de Supabase
export interface ContenidoExclusivo {
    id: number;
    artista_id: string; // UUID - FK a artistas (alineado con SQL)
    contenido_id: string; // ID del contenido relacionado (canción, álbum, etc.)
    tipo_contenido: 'cancion' | 'album' | 'letra' | 'video' | 'foto'; // Alineado con CHECK constraint SQL
    descripcion: string;
    nivel_acceso_requerido: number; // 1=básico, 2=premium, 3=vip (alineado con SQL)
    precio_individual?: number; // Precio opcional para compra individual
    imagen_portada?: string; // URL de imagen de portada (agregado para soporte de imágenes)
    activo: boolean;
    created_at: string; // timestamp
    updated_at: string; // timestamp
}

// Interface extendida para funcionalidad adicional del frontend
export interface ContenidoExclusivoExtendido extends ContenidoExclusivo {
    titulo?: string; // Para mostrar en UI
    archivoUrl?: string; // URL del archivo
    imagenPortada?: string; // URL de imagen de portada/preview  
    fechaPublicacion?: Date; // Para UI
    fechaExpiracion?: Date; // Para UI
    cancionRelacionada?: number; // FK a canciones si aplica
    albumRelacionado?: number; // FK a álbum si aplica
    visualizaciones?: number; // Para estadísticas
    tags?: string[]; // etiquetas para filtrado
    metadata?: {
        duracion?: number; // para videos/audio en segundos
        resolucion?: string; // para fotos/videos
        formato?: string; // mp3, jpg, mp4, etc.
    };
}

// Interface para estadísticas (calculadas dinámicamente)
export interface EstadisticasContenidoExclusivo {
    artista_id: string;
    total_contenido: number;
    canciones_exclusivas: number;
    albums_exclusivos: number;
    letras_exclusivas: number;
    videos_exclusivos: number;
    fotos_exclusivas: number;
    contenido_basico: number;  // nivel 1
    contenido_premium: number; // nivel 2
    contenido_vip: number;     // nivel 3
    precio_promedio_individual: number;
    contenido_activo: number;
}

// Interface para manejo de uploads de archivos
export interface ArchivoUpload {
    file: File;
    tipo: 'contenido' | 'portada';
    uploading: boolean;
    uploadProgress: number;
    url?: string;
    error?: string;
}

// Interface para configuración de uploads
export interface ConfiguracionUpload {
    maxSizeBytes: number;
    allowedTypes: string[];
    bucketName: string;
}

// Configuraciones por tipo de contenido
export const CONFIGURACIONES_UPLOAD: { [key: string]: ConfiguracionUpload } = {
    foto: {
        maxSizeBytes: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        bucketName: 'contenido-exclusivo'
    },
    video: {
        maxSizeBytes: 100 * 1024 * 1024, // 100MB
        allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
        bucketName: 'contenido-exclusivo'
    },
    cancion: {
        maxSizeBytes: 50 * 1024 * 1024, // 50MB
        allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4'],
        bucketName: 'contenido-exclusivo'
    },
    album: {
        maxSizeBytes: 200 * 1024 * 1024, // 200MB (múltiples canciones)
        allowedTypes: ['application/zip', 'audio/mpeg', 'audio/wav'],
        bucketName: 'contenido-exclusivo'
    },
    letra: {
        maxSizeBytes: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['text/plain', 'application/pdf', 'text/html'],
        bucketName: 'contenido-exclusivo'
    },
    portada: {
        maxSizeBytes: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        bucketName: 'contenido-exclusivo'
    }
};
