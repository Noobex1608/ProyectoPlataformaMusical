// src/app/services/artista-integration.service.ts
import { Injectable } from '@angular/core';
import { Observable, map, combineLatest, forkJoin } from 'rxjs';
import { MembresiaService } from './membresia.service';
import { PropinaService } from './propina.service';
import { TransaccionService } from './transaccion.service';
import { SuscripcionService } from './suscripcion.service';
import { SupabaseClientService } from './supabase-client.service';

export interface ContenidoExclusivoArtista {
    id?: number;
    artista_id: string;
    contenido_id: string;
    tipo_contenido: 'cancion' | 'album' | 'letra' | 'video' | 'foto';
    nivel_acceso_requerido: number;
    precio_individual?: number;
    descripcion: string;
    activo: boolean;
    created_at?: string;
}

export interface DashboardIngresos {
    totalIngresos: number;
    ingresosPropinas: number;
    ingresosMembresias: number;
    totalSuscriptores: number;
    propinaPromedio: number;
    crecimientoMensual: number;
    topFans: Array<{ nombre: string; totalPropinas: number }>;
    ingresosUltimos30Dias: Array<{ fecha: string; monto: number }>;
}

@Injectable({ providedIn: 'root' })
export class ArtistaIntegrationService {

    constructor(
        private membresiaService: MembresiaService,
        private propinaService: PropinaService,
        private transaccionService: TransaccionService,
        private suscripcionService: SuscripcionService,
        private supabaseClient: SupabaseClientService
    ) {}

    // 1. Marcar canciones con contenido exclusivo
    marcarContenidoExclusivo(contenido: Omit<ContenidoExclusivoArtista, 'id' | 'created_at'>): Observable<ContenidoExclusivoArtista> {
        return this.supabaseClient.createRecord<ContenidoExclusivoArtista>('contenido_exclusivo_artista', contenido);
    }

    // 2. Obtener contenido exclusivo del artista
    obtenerContenidoExclusivoArtista(artistaId: string): Observable<ContenidoExclusivoArtista[]> {
        return this.supabaseClient.getRecords<ContenidoExclusivoArtista>('contenido_exclusivo_artista', {
            artista_id: artistaId,
            activo: true
        });
    }

    // 3. Actualizar niveles de acceso para contenido
    actualizarNivelAcceso(contenidoId: number, nuevoNivel: number): Observable<ContenidoExclusivoArtista> {
        return this.supabaseClient.updateRecord<ContenidoExclusivoArtista>('contenido_exclusivo_artista', contenidoId, {
            nivel_acceso_requerido: nuevoNivel
        });
    }

    // 4. Dashboard de ingresos integrado
    obtenerDashboardIngresos(artistaId: string): Observable<DashboardIngresos> {
        const fechaHace30Dias = new Date();
        fechaHace30Dias.setDate(fechaHace30Dias.getDate() - 30);

        return forkJoin({
            propinas: this.propinaService.obtenerPropinasPorArtista(artistaId),
            transacciones: this.transaccionService.obtenerTransaccionesPorArtista(artistaId),
            suscripciones: this.suscripcionService.obtenerPorArtista(artistaId),
            membresias: this.membresiaService.obtenerMembresiasPorArtista(artistaId)
        }).pipe(
            map(({ propinas, transacciones, suscripciones, membresias }) => {
                // Calcular ingresos por propinas
                const ingresosPropinas = propinas.reduce((total, propina) => total + propina.cantidad, 0);
                
                // Calcular ingresos por membresías
                const ingresosMembresias = transacciones
                    .filter(t => t.tipo === 'membresia')
                    .reduce((total, trans) => total + trans.monto, 0);

                const totalIngresos = ingresosPropinas + ingresosMembresias;

                // Propina promedio
                const propinaPromedio = propinas.length > 0 ? ingresosPropinas / propinas.length : 0;

                // Top fans (por propinas)
                const fansMap = new Map<string, number>();
                propinas.forEach(propina => {
                    const fan = propina.nombre_fan;
                    fansMap.set(fan, (fansMap.get(fan) || 0) + propina.cantidad);
                });
                
                const topFans = Array.from(fansMap.entries())
                    .map(([nombre, totalPropinas]) => ({ nombre, totalPropinas }))
                    .sort((a, b) => b.totalPropinas - a.totalPropinas)
                    .slice(0, 5);

                // Ingresos últimos 30 días (simplificado)
                const ingresosUltimos30Dias = this.calcularIngresosDiarios(propinas, transacciones);

                return {
                    totalIngresos,
                    ingresosPropinas,
                    ingresosMembresias,
                    totalSuscriptores: suscripciones.length,
                    propinaPromedio,
                    crecimientoMensual: 15.5, // Placeholder - se calcularía comparando con mes anterior
                    topFans,
                    ingresosUltimos30Dias
                } as DashboardIngresos;
            })
        );
    }

    // 5. Gestionar tipos de contenido premium
    crearTipoContenidoPremium(artistaId: string, tipoContenido: {
        nombre: string;
        descripcion: string;
        precio: number;
        nivelRequerido: number;
    }): Observable<any> {
        const membresia = {
            artista_id: artistaId,
            nombre: tipoContenido.nombre,
            descripcion: tipoContenido.descripcion,
            precio: tipoContenido.precio,
            duracion_dias: 30,
            beneficios: {
                acceso_exclusivo: true,
                contenido_premium: true,
                nivel_acceso: tipoContenido.nivelRequerido
            },
            activa: true
        };

        return this.membresiaService.agregarMembresia(membresia);
    }

    // 6. Obtener estadísticas de engagement
    obtenerEstadisticasEngagement(artistaId: string): Observable<{
        totalInteracciones: number;
        propinasRecientes: number;
        suscripcionesActivas: number;
        conversionRate: number;
    }> {
        return combineLatest([
            this.propinaService.obtenerPropinasPorArtista(artistaId),
            this.suscripcionService.obtenerPorArtista(artistaId)
        ]).pipe(
            map(([propinas, suscripciones]) => {
                const fechaHace7Dias = new Date();
                fechaHace7Dias.setDate(fechaHace7Dias.getDate() - 7);

                const propinasRecientes = propinas.filter(p => 
                    new Date(p.fecha) >= fechaHace7Dias
                ).length;

                return {
                    totalInteracciones: propinas.length + suscripciones.length,
                    propinasRecientes,
                    suscripcionesActivas: suscripciones.length,
                    conversionRate: suscripciones.length > 0 ? (propinas.length / suscripciones.length) * 100 : 0
                };
            })
        );
    }

    private calcularIngresosDiarios(propinas: any[], transacciones: any[]): Array<{ fecha: string; monto: number }> {
        const ingresosPorDia = new Map<string, number>();
        
        // Agregar propinas
        propinas.forEach(propina => {
            const fecha = new Date(propina.fecha).toISOString().split('T')[0];
            ingresosPorDia.set(fecha, (ingresosPorDia.get(fecha) || 0) + propina.cantidad);
        });

        // Agregar transacciones
        transacciones.forEach(trans => {
            const fecha = new Date(trans.fecha_transaccion).toISOString().split('T')[0];
            ingresosPorDia.set(fecha, (ingresosPorDia.get(fecha) || 0) + trans.monto_total);
        });

        return Array.from(ingresosPorDia.entries())
            .map(([fecha, monto]) => ({ fecha, monto }))
            .sort((a, b) => a.fecha.localeCompare(b.fecha));
    }

    // Función para exponer API al microfrontend de Artista
    exposeArtistaAPI(): void {
        (window as any).monetizacionArtistaAPI = {
            marcarContenidoExclusivo: this.marcarContenidoExclusivo.bind(this),
            obtenerDashboardIngresos: this.obtenerDashboardIngresos.bind(this),
            obtenerContenidoExclusivo: this.obtenerContenidoExclusivoArtista.bind(this),
            actualizarNivelAcceso: this.actualizarNivelAcceso.bind(this),
            crearTipoContenidoPremium: this.crearTipoContenidoPremium.bind(this),
            obtenerEstadisticasEngagement: this.obtenerEstadisticasEngagement.bind(this)
        };
    }
}
