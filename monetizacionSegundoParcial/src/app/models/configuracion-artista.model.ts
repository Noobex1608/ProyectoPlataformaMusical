export interface ConfiguracionArtista {
    id: number; // bigint en PostgreSQL se mapea a number en TypeScript
    artista_id: string; // FK a artistas UUID
    configuracion_general: any; // JSONB con configuraciones generales
    configuracion_contenido: any; // JSONB con configuraciones de contenido
    configuracion_pagos: any; // JSONB con configuraciones de pagos
    configuracion_privacidad: any; // JSONB con configuraciones de privacidad
    fecha_actualizacion: string; // timestamp with time zone
    created_at: string; // timestamp with time zone
}

// Interface para compatibilidad con código anterior
export interface ConfiguracionArtistaLegacy {
    id: number;
    artistaId: string; // Mapea a artista_id
    configuracionGeneral: {
        membresiasPorDefectoActivas: boolean;
        propinasMinimasHabilitadas: boolean;
        montoMinimoPropoina: number;
        autoAprobacionRecompensas: boolean;
        notificacionesEmail: boolean;
        notificacionesApp: boolean;
    };
    configuracionContenido: {
        marcaAguaEnFotos: boolean;
        calidadVideoMaxima: '720p' | '1080p' | '4K';
        limiteTamañoArchivo: number; // en MB
        tiposArchivoPermitidos: string[];
        autoPublicacionContenido: boolean;
    };
    configuracionPagos: {
        cuentaBancaria?: string;
        metodoPagoPreferido: string;
        frecuenciaPagos: 'semanal' | 'quincenal' | 'mensual';
        montoMinimoRetiro: number;
        comisionPersonalizada?: number; // si tiene acuerdo especial
    };
    configuracionPrivacidad: {
        perfilPublico: boolean;
        mostrarEstadisticas: boolean;
        permitirMensajesDirectos: boolean;
        filtroContenidoAdulto: boolean;
    };
    fechaActualizacion: Date; // Mapea a fecha_actualizacion
}
