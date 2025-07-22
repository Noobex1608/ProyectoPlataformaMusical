export interface Membresia {
    id: number;
    artista_id: string; // FK a artistas UUID
    nombre: string; // "Fan Básico", "Fan Premium", "VIP"
    descripcion?: string;
    precio: number;
    duracion_dias: number; // duración en días
    activa: boolean;
    beneficios?: any; // JSON con los beneficios incluidos
    created_at: string;
    updated_at: string;
}

// Interface para compatibilidad con código anterior
export interface MembresiaLegacy {
    id: number;
    artistaId: string; // Mapea a artista_id
    nombre: string;
    descripcion: string;
    precio: number;
    duracionDias: number; // Mapea a duracion_dias
    privilegios: {
        accesoLetrasExclusivas: boolean;
        accesoAvancesCanciones: boolean; 
        accesoFotosExclusivas: boolean;
        descuentosEventos: number;
        chatPrivadoArtista: boolean;
        contenidoDetrasEscenas: boolean;
    };
    limitesContenido: {
        maxFotosExclusivasMes: number;
        maxAvancesMes: number;
        maxMensajesPrivados: number;
    };
    beneficios: string[];
    activa: boolean;
    fechaCreacion: Date; // Mapea a created_at
}
    