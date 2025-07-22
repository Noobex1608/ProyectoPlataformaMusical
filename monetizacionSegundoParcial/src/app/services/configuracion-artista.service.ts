import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ConfiguracionArtista } from '../models/configuracion-artista.model';
import { 
    ConfiguracionMonetizacion, 
    ValidacionConfiguracion,
    PlantillaConfiguracion 
} from '../models/configuracion-monetizacion.model';
import { supabase } from '../supabase.service';

@Injectable({ providedIn: 'root' })
export class ConfiguracionArtistaService {
    private configuracionesSubject = new BehaviorSubject<ConfiguracionArtista[]>([]);

    constructor() {}

    // ===============================================
    // MÉTODOS PRINCIPALES SUPABASE DIRECTOS
    // ===============================================

    /**
     * Obtener configuración por artista directamente de Supabase
     */
    obtenerConfiguracionPorArtista(artistaId: string): Observable<ConfiguracionArtista | null> {
        return new Observable(observer => {
            supabase
                .from('configuracion_artista')
                .select('*')
                .eq('artista_id', artistaId)
                .single()
                .then(response => {
                    if (response.error) {
                        if (response.error.code === 'PGRST116') {
                            // No hay configuración, devolver null
                            observer.next(null);
                            observer.complete();
                        } else {
                            console.error('Error obteniendo configuración:', response.error);
                            observer.error(response.error);
                        }
                    } else {
                        observer.next(response.data);
                        observer.complete();
                    }
                });
        });
    }

    /**
     * Crear nueva configuración
     */
    crearConfiguracion(config: Omit<ConfiguracionArtista, 'id' | 'created_at' | 'fecha_actualizacion'>): Observable<ConfiguracionArtista> {
        return new Observable(observer => {
            const nuevaConfiguracion = {
                ...config,
                fecha_actualizacion: new Date().toISOString(),
                created_at: new Date().toISOString()
            };

            supabase
                .from('configuracion_artista')
                .insert([nuevaConfiguracion])
                .select()
                .single()
                .then(response => {
                    if (response.error) {
                        console.error('Error creando configuración:', response.error);
                        observer.error(response.error);
                    } else {
                        observer.next(response.data);
                        observer.complete();
                    }
                });
        });
    }

    /**
     * Actualizar configuración existente
     */
    actualizarConfiguracion(artistaId: string, configuracion: Partial<ConfiguracionArtista>): Observable<ConfiguracionArtista> {
        return this.obtenerConfiguracionPorArtista(artistaId).pipe(
            switchMap(config => {
                if (!config) {
                    // Si no existe configuración, crear una nueva
                    const nuevaConfig: Omit<ConfiguracionArtista, 'id' | 'created_at' | 'fecha_actualizacion'> = {
                        artista_id: artistaId,
                        configuracion_general: configuracion.configuracion_general || {},
                        configuracion_contenido: configuracion.configuracion_contenido || {},
                        configuracion_pagos: configuracion.configuracion_pagos || {},
                        configuracion_privacidad: configuracion.configuracion_privacidad || {}
                    };
                    return this.crearConfiguracion(nuevaConfig);
                } else {
                    // Actualizar configuración existente
                    return new Observable<ConfiguracionArtista>(observer => {
                        const actualizacion = {
                            ...configuracion,
                            fecha_actualizacion: new Date().toISOString()
                        };

                        supabase
                            .from('configuracion_artista')
                            .update(actualizacion)
                            .eq('artista_id', artistaId) // Usar artista_id en lugar de id
                            .select()
                            .single()
                            .then(response => {
                                if (response.error) {
                                    console.error('Error actualizando configuración:', response.error);
                                    observer.error(response.error);
                                } else {
                                    observer.next(response.data);
                                    observer.complete();
                                }
                            });
                    });
                }
            }),
            catchError(error => {
                console.error('Error actualizando configuración:', error);
                throw error;
            })
        );
    }

    // ===============================================
    // MÉTODOS ESPECÍFICOS DE CONFIGURACIÓN
    // ===============================================

    /**
     * Obtener configuración de comisiones
     */
    obtenerConfiguracionComisiones(artistaId: string): Observable<{
        comisionMembresias: number;
        comisionPropinas: number;
        comisionEventos: number;
        limiteRetiroMinimo: number;
    }> {
        return this.obtenerConfiguracionPorArtista(artistaId).pipe(
            map(config => {
                const pagos = config?.configuracion_pagos || {};
                return {
                    comisionMembresias: pagos.comisionMembresias || 10,
                    comisionPropinas: pagos.comisionPropinas || 5,
                    comisionEventos: pagos.comisionEventos || 15,
                    limiteRetiroMinimo: pagos.montoMinimoRetiro || 50
                };
            }),
            catchError(() => of({
                comisionMembresias: 10,
                comisionPropinas: 5,
                comisionEventos: 15,
                limiteRetiroMinimo: 50
            }))
        );
    }

    /**
     * Actualizar comisiones
     */
    actualizarComisiones(artistaId: string, comisiones: any): Observable<ConfiguracionArtista> {
        return this.obtenerConfiguracionPorArtista(artistaId).pipe(
            switchMap(config => {
                if (config) {
                    const nuevaConfiguracionPagos = {
                        ...config.configuracion_pagos,
                        ...comisiones
                    };
                    return this.actualizarConfiguracion(artistaId, { 
                        configuracion_pagos: nuevaConfiguracionPagos 
                    });
                } else {
                    return this.crearConfiguracion({
                        artista_id: artistaId,
                        configuracion_general: {},
                        configuracion_contenido: {},
                        configuracion_pagos: comisiones,
                        configuracion_privacidad: {}
                    });
                }
            })
        );
    }

    /**
     * Obtener límites financieros
     */
    obtenerLimitesFinancieros(artistaId: string): Observable<any> {
        return this.obtenerConfiguracionPorArtista(artistaId).pipe(
            map(config => {
                const pagos = config?.configuracion_pagos || {};
                return {
                    retiroMinimo: pagos.montoMinimoRetiro || 50,
                    comisionPersonalizada: pagos.comisionPersonalizada || 10,
                    metodoPago: pagos.metodoPagoPreferido || 'transferencia',
                    frecuenciaPagos: pagos.frecuenciaPagos || 'mensual'
                };
            }),
            catchError(() => of({
                retiroMinimo: 50,
                comisionPersonalizada: 10,
                metodoPago: 'transferencia',
                frecuenciaPagos: 'mensual'
            }))
        );
    }

    /**
     * Actualizar límites financieros
     */
    actualizarLimitesFinancieros(artistaId: string, limites: any): Observable<ConfiguracionArtista> {
        return this.obtenerConfiguracionPorArtista(artistaId).pipe(
            switchMap(config => {
                if (config) {
                    const nuevaConfiguracionPagos = {
                        ...config.configuracion_pagos,
                        ...limites
                    };
                    return this.actualizarConfiguracion(artistaId, { 
                        configuracion_pagos: nuevaConfiguracionPagos 
                    });
                } else {
                    return this.crearConfiguracion({
                        artista_id: artistaId,
                        configuracion_general: {},
                        configuracion_contenido: {},
                        configuracion_pagos: limites,
                        configuracion_privacidad: {}
                    });
                }
            })
        );
    }

    /**
     * Obtener preferencias de notificaciones
     */
    obtenerPreferenciasNotificaciones(artistaId: string): Observable<any> {
        return this.obtenerConfiguracionPorArtista(artistaId).pipe(
            map(config => {
                const general = config?.configuracion_general || {};
                return {
                    notificacionesEmail: general.notificacionesEmail !== false,
                    notificacionesApp: general.notificacionesApp !== false,
                    notificacionesPropinas: general.notificacionesPropinas !== false,
                    notificacionesMembresias: general.notificacionesMembresias !== false,
                    notificacionesComentarios: general.notificacionesComentarios !== false,
                    notificacionesSeguidores: general.notificacionesSeguidores !== false,
                    frecuenciaResumen: general.frecuenciaResumen || 'diario'
                };
            }),
            catchError(() => of({
                notificacionesEmail: true,
                notificacionesApp: true,
                notificacionesPropinas: true,
                notificacionesMembresias: true,
                notificacionesComentarios: true,
                notificacionesSeguidores: true,
                frecuenciaResumen: 'diario'
            }))
        );
    }

    /**
     * Actualizar preferencias de notificaciones
     */
    actualizarPreferenciasNotificaciones(artistaId: string, preferencias: any): Observable<ConfiguracionArtista> {
        return this.obtenerConfiguracionPorArtista(artistaId).pipe(
            switchMap(config => {
                if (config) {
                    const nuevaConfiguracionGeneral = {
                        ...config.configuracion_general,
                        ...preferencias
                    };
                    return this.actualizarConfiguracion(artistaId, { 
                        configuracion_general: nuevaConfiguracionGeneral 
                    });
                } else {
                    return this.crearConfiguracion({
                        artista_id: artistaId,
                        configuracion_general: preferencias,
                        configuracion_contenido: {},
                        configuracion_pagos: {},
                        configuracion_privacidad: {}
                    });
                }
            })
        );
    }

    /**
     * Obtener configuración de privacidad
     */
    obtenerConfiguracionPrivacidad(artistaId: string): Observable<any> {
        return this.obtenerConfiguracionPorArtista(artistaId).pipe(
            map(config => {
                const privacidad = config?.configuracion_privacidad || {};
                return {
                    perfilPublico: privacidad.perfilPublico !== false,
                    mostrarEstadisticas: privacidad.mostrarEstadisticas !== false,
                    permitirMensajesDirectos: privacidad.permitirMensajesDirectos !== false,
                    filtroContenidoAdulto: privacidad.filtroContenidoAdulto !== false
                };
            }),
            catchError(() => of({
                perfilPublico: true,
                mostrarEstadisticas: true,
                permitirMensajesDirectos: true,
                filtroContenidoAdulto: false
            }))
        );
    }

    /**
     * Actualizar configuración de privacidad
     */
    actualizarConfiguracionPrivacidad(artistaId: string, privacidad: any): Observable<ConfiguracionArtista> {
        return this.obtenerConfiguracionPorArtista(artistaId).pipe(
            switchMap(config => {
                if (config) {
                    const nuevaConfiguracionPrivacidad = {
                        ...config.configuracion_privacidad,
                        ...privacidad
                    };
                    return this.actualizarConfiguracion(artistaId, { 
                        configuracion_privacidad: nuevaConfiguracionPrivacidad 
                    });
                } else {
                    return this.crearConfiguracion({
                        artista_id: artistaId,
                        configuracion_general: {},
                        configuracion_contenido: {},
                        configuracion_pagos: {},
                        configuracion_privacidad: privacidad
                    });
                }
            })
        );
    }

    /**
     * Obtener configuración de contenido
     */
    obtenerConfiguracionContenido(artistaId: string): Observable<any> {
        return this.obtenerConfiguracionPorArtista(artistaId).pipe(
            map(config => {
                const contenido = config?.configuracion_contenido || {};
                return {
                    marcaAguaEnFotos: contenido.marcaAguaEnFotos !== false,
                    calidadVideoMaxima: contenido.calidadVideoMaxima || '1080p',
                    limiteTamañoArchivo: contenido.limiteTamañoArchivo || 100,
                    tiposArchivoPermitidos: contenido.tiposArchivoPermitidos || ['jpg', 'png', 'mp4', 'mp3'],
                    autoPublicacionContenido: contenido.autoPublicacionContenido !== false
                };
            }),
            catchError(() => of({
                marcaAguaEnFotos: true,
                calidadVideoMaxima: '1080p',
                limiteTamañoArchivo: 100,
                tiposArchivoPermitidos: ['jpg', 'png', 'mp4', 'mp3'],
                autoPublicacionContenido: true
            }))
        );
    }

    /**
     * Actualizar configuración de contenido
     */
    actualizarConfiguracionContenido(artistaId: string, contenido: any): Observable<ConfiguracionArtista> {
        return this.obtenerConfiguracionPorArtista(artistaId).pipe(
            switchMap(config => {
                if (config) {
                    const nuevaConfiguracionContenido = {
                        ...config.configuracion_contenido,
                        ...contenido
                    };
                    return this.actualizarConfiguracion(artistaId, { 
                        configuracion_contenido: nuevaConfiguracionContenido 
                    });
                } else {
                    return this.crearConfiguracion({
                        artista_id: artistaId,
                        configuracion_general: {},
                        configuracion_contenido: contenido,
                        configuracion_pagos: {},
                        configuracion_privacidad: {}
                    });
                }
            })
        );
    }
}
