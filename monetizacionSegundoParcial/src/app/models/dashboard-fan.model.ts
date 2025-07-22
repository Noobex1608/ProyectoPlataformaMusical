import { ArtistaConEstadisticas } from './artista.model';
import { SeguimientoInfo } from './seguidor.model';

export interface EstadisticasFan {
    artistasSiguiendo: number;
    membresiaActivas: number;
    gastoMensual: number;
    propinasEnviadas: number;
}

export interface ActividadReciente {
    id?: number;
    tipo: 'suscripcion' | 'propina' | 'contenido' | 'seguimiento';
    icono: string;
    titulo: string;
    detalle: string;
    tiempo: string;
    fecha?: string;
    artista?: {
        id: string;
        nombre: string;
        imagen?: string;
    };
    monto?: number;
}

export interface DashboardFanData {
    estadisticas: EstadisticasFan;
    actividadReciente: ActividadReciente[];
    artistasRecomendados: ArtistaRecomendado[];
    artistasSeguidos: SeguimientoInfo[];
}

export interface ArtistaRecomendado {
    id: string;
    nombre: string;
    genero?: string;
    imagen?: string;
    precioMinimo: number;
    seguidores: string;
    descripcion?: string;
}
