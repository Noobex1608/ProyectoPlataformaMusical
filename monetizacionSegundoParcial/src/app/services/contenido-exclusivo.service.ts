import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ContenidoExclusivo } from '../models/contenido-exclusivo.model';
import { AccesoContenido, NuevoAccesoContenido, ValidacionAcceso, EstadisticasAcceso } from '../models/acceso-contenido.model';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({ providedIn: 'root' })
export class ContenidoExclusivoService {
    private contenidosSubject = new BehaviorSubject<ContenidoExclusivo[]>([]);

    constructor(private supabaseClient: SupabaseClientService) {
        this.loadContenidos();
    }

    private loadContenidos(): void {
        console.log('🔍 ContenidoExclusivoService: Intentando cargar contenidos...');
        this.supabaseClient.getRecords<ContenidoExclusivo>('contenido_exclusivo_artista').subscribe({
            next: (contenidos) => {
                console.log('✅ Contenidos cargados exitosamente:', contenidos);
                this.contenidosSubject.next(contenidos);
            },
            error: (error) => {
                console.error('❌ Error cargando contenidos:', error);
                console.log('🔧 Posibles soluciones:');
                console.log('1. Verificar que la tabla "contenido_exclusivo_artista" existe en Supabase');
                console.log('2. Revisar las políticas RLS de la tabla');
                console.log('3. Ejecutar el script diagnostico_tablas.sql');
                // Continuar con array vacío para evitar que la app se rompa
                this.contenidosSubject.next([]);
            }
        });
    }

    obtenerContenidoPorArtista(artistaId: string): Observable<ContenidoExclusivo[]> {
        console.log('🔍 Obteniendo contenido para artista:', artistaId);
        return this.supabaseClient.getRecords<ContenidoExclusivo>('contenido_exclusivo_artista', { 
            artista_id: artistaId, 
            activo: true 
        }).pipe(
            map(contenidos => {
                console.log('✅ Contenidos encontrados para artista:', contenidos.length);
                console.log('🔍 Primer contenido con todos los campos:', contenidos[0]); // DEBUG
                return contenidos;
            }),
            catchError(error => {
                console.error('❌ Error obteniendo contenido por artista:', error);
                return of([]); // Retornar array vacío en caso de error
            })
        );
    }

    obtenerContenidoPorNivelMembresia(
        artistaId: string, 
        nivelMembresia: number
    ): Observable<ContenidoExclusivo[]> {
        return this.supabaseClient.getRecords<ContenidoExclusivo>('contenido_exclusivo_artista', { 
            artista_id: artistaId, 
            activo: true 
        }).pipe(
            map(contenidos => contenidos.filter(c => c.nivel_acceso_requerido <= nivelMembresia))
        );
    }

    obtenerContenidoPorTipo(artistaId: string, tipo: string): Observable<ContenidoExclusivo[]> {
        return this.supabaseClient.getRecords<ContenidoExclusivo>('contenido_exclusivo_artista', { 
            artista_id: artistaId, 
            tipo_contenido: tipo,
            activo: true 
        });
    }

    obtenerContenidoPorId(id: number): Observable<ContenidoExclusivo | null> {
        return this.supabaseClient.getRecordById<ContenidoExclusivo>('contenido_exclusivo_artista', id);
    }

    crearContenido(contenido: Omit<ContenidoExclusivo, 'id'>): Observable<ContenidoExclusivo> {
        console.log('🚀 ContenidoExclusivoService: Creando contenido:', contenido);
        
        // Asegurar que las fechas estén correctamente formateadas
        const nuevoContenido = {
            ...contenido,
            created_at: contenido.created_at || new Date().toISOString(),
            updated_at: contenido.updated_at || new Date().toISOString()
        };
        
        return this.supabaseClient.createRecord<ContenidoExclusivo>('contenido_exclusivo_artista', nuevoContenido).pipe(
            map(resultado => {
                console.log('✅ Contenido creado exitosamente:', resultado);
                this.loadContenidos(); // Recargar la lista
                return resultado;
            }),
            catchError(error => {
                console.error('❌ Error creando contenido:', error);
                throw error;
            })
        );
    }

    actualizarContenido(id: number, actualizacion: Partial<ContenidoExclusivo>): Observable<ContenidoExclusivo> {
        return this.supabaseClient.updateRecord<ContenidoExclusivo>('contenido_exclusivo_artista', id, actualizacion);
    }

    desactivarContenido(id: number): Observable<ContenidoExclusivo> {
        return this.supabaseClient.updateRecord<ContenidoExclusivo>('contenido_exclusivo_artista', id, { activo: false });
    }

    incrementarVisualizaciones(id: number): Observable<ContenidoExclusivo> {
        // Método simplificado - visualizaciones no disponibles en modelo base
        return this.supabaseClient.getRecordById<ContenidoExclusivo>('contenido_exclusivo_artista', id).pipe(
            map(contenido => {
                if (!contenido) {
                    throw new Error('Contenido no encontrado');
                }
                return contenido;
            }),
            catchError(error => {
                console.error('Error accediendo al contenido:', error);
                throw error;
            })
        );
    }

    verificarAcceso(contenidoId: number, nivelMembresiaUsuario: number): Observable<{
        tieneAcceso: boolean;
        razon?: string;
    }> {
        return this.supabaseClient.getRecordById<ContenidoExclusivo>('contenido_exclusivo_artista', contenidoId).pipe(
            map(contenido => {
                if (!contenido) {
                    return { tieneAcceso: false, razon: 'Contenido no encontrado' };
                }
                
                if (!contenido.activo) {
                    return { tieneAcceso: false, razon: 'Contenido no disponible' };
                }
                
                if (contenido.nivel_acceso_requerido > nivelMembresiaUsuario) {
                    return { tieneAcceso: false, razon: 'Nivel de membresía insuficiente' };
                }
                
                return { tieneAcceso: true };
            }),
            catchError(() => of({ tieneAcceso: false, razon: 'Error al verificar acceso' }))
        );
    }

    obtenerEstadisticasContenido(artistaId: string): Observable<{
        totalContenido: number;
        contenidoActivo: number;
        contenidoPorTipo: { [tipo: string]: number };
        visualizacionesTotales: number;
        promedioVisualizaciones: number;
    }> {
        return this.supabaseClient.getRecords<ContenidoExclusivo>('contenido_exclusivo_artista', { 
            artista_id: artistaId 
        }).pipe(
            map(contenidos => {
                const totalVisualizaciones = 0; // No disponible en modelo base
                
                return {
                    totalContenido: contenidos.length,
                    contenidoActivo: contenidos.filter(c => c.activo).length,
                    contenidoPorTipo: contenidos.reduce((tipos, c) => {
                        tipos[c.tipo_contenido] = (tipos[c.tipo_contenido] || 0) + 1;
                        return tipos;
                    }, {} as { [tipo: string]: number }),
                    visualizacionesTotales: totalVisualizaciones,
                    promedioVisualizaciones: 0
                };
            }),
            catchError(() => of({
                totalContenido: 0,
                contenidoActivo: 0,
                contenidoPorTipo: {},
                visualizacionesTotales: 0,
                promedioVisualizaciones: 0
            }))
        );
    }

    // ========================================
    // MÉTODOS PARA GESTIÓN DE ACCESO CONTENIDO
    // ========================================

    /**
     * Valida si un usuario tiene acceso a un contenido específico
     */
    validarAccesoContenido(
        usuarioId: string, 
        contenidoId: number, 
        artistaId: string
    ): Observable<ValidacionAcceso> {
        console.log('🔐 Validando acceso al contenido:', { usuarioId, contenidoId, artistaId });

        return this.obtenerContenidoPorId(contenidoId).pipe(
            switchMap(contenido => {
                if (!contenido || !contenido.activo) {
                    return of({
                        tiene_acceso: false,
                        razon: 'contenido_inactivo'
                    } as ValidacionAcceso);
                }

                // Verificar acceso existente
                return this.supabaseClient.getRecords<AccesoContenido>('acceso_contenido', {
                    usuario_id: usuarioId,
                    contenido_id: contenidoId
                }).pipe(
                    switchMap(accesos => {
                        // Verificar si ya tiene acceso válido
                        const accesoValido = accesos.find(a => {
                            if (a.fecha_expiracion) {
                                return new Date(a.fecha_expiracion) > new Date();
                            }
                            return true;
                        });

                        if (accesoValido) {
                            return of({
                                tiene_acceso: true,
                                acceso_existente: accesoValido
                            } as ValidacionAcceso);
                        }

                        // Verificar membresías activas
                        return this.supabaseClient.getRecords<any>('suscripciones_usuario', {
                            usuario_id: usuarioId,
                            artista_id: artistaId,
                            activa: true
                        }).pipe(
                            map(suscripciones => {
                                const suscripcionActiva = suscripciones.find(s => {
                                    const fechaFin = new Date(s.fecha_fin);
                                    return fechaFin > new Date();
                                });

                                if (suscripcionActiva) {
                                    return {
                                        tiene_acceso: true
                                    } as ValidacionAcceso;
                                }

                                return {
                                    tiene_acceso: false,
                                    razon: 'sin_membresia',
                                    opciones_acceso: {
                                        puede_comprar_individual: !!contenido.precio_individual,
                                        membresias_disponibles: [],
                                        precio_individual: contenido.precio_individual
                                    }
                                } as ValidacionAcceso;
                            })
                        );
                    })
                );
            }),
            catchError(error => {
                console.error('❌ Error validando acceso:', error);
                return of({
                    tiene_acceso: false,
                    razon: 'contenido_inactivo'
                } as ValidacionAcceso);
            })
        );
    }

    /**
     * Otorga acceso a un contenido (por membresía, propina, etc.)
     */
    otorgarAccesoContenido(nuevoAcceso: NuevoAccesoContenido): Observable<AccesoContenido> {
        console.log('🎯 Otorgando acceso al contenido:', nuevoAcceso);

        const accesoCompleto = {
            ...nuevoAcceso,
            fecha_acceso: new Date().toISOString(),
            created_at: new Date().toISOString()
        };

        return this.supabaseClient.createRecord<AccesoContenido>('acceso_contenido', accesoCompleto).pipe(
            map(acceso => {
                console.log('✅ Acceso otorgado exitosamente:', acceso);
                return acceso;
            }),
            catchError(error => {
                console.error('❌ Error otorgando acceso:', error);
                throw error;
            })
        );
    }

    /**
     * Registra el acceso a un contenido (para estadísticas)
     */
    registrarAccesoContenido(
        usuarioId: string, 
        contenidoId: number, 
        artistaId: string,
        tipoAcceso: 'membresia' | 'propina' | 'regalo' | 'promocional' = 'membresia'
    ): Observable<AccesoContenido> {
        const nuevoAcceso: NuevoAccesoContenido = {
            usuario_id: usuarioId,
            artista_id: artistaId,
            contenido_id: contenidoId,
            tipo_acceso: tipoAcceso,
            metadata: {
                dispositivo: navigator.userAgent,
                timestamp: new Date().toISOString()
            }
        };

        return this.otorgarAccesoContenido(nuevoAcceso);
    }

    /**
     * Obtiene el historial de accesos de un usuario
     */
    obtenerHistorialAccesos(usuarioId: string): Observable<AccesoContenido[]> {
        return this.supabaseClient.getRecords<AccesoContenido>('acceso_contenido', {
            usuario_id: usuarioId
        }).pipe(
            map(accesos => accesos.sort((a, b) => 
                new Date(b.fecha_acceso).getTime() - new Date(a.fecha_acceso).getTime()
            ))
        );
    }

    /**
     * Obtiene estadísticas de acceso para un contenido específico
     */
    obtenerEstadisticasAcceso(contenidoId: number): Observable<EstadisticasAcceso> {
        return this.supabaseClient.getRecords<AccesoContenido>('acceso_contenido', {
            contenido_id: contenidoId
        }).pipe(
            map(accesos => {
                const usuarios_unicos = new Set(accesos.map(a => a.usuario_id)).size;
                const fechas = accesos.map(a => a.fecha_acceso).sort();
                
                const estadisticas: EstadisticasAcceso = {
                    artista_id: accesos[0]?.artista_id || '',
                    contenido_id: contenidoId,
                    total_accesos: accesos.length,
                    accesos_por_membresia: accesos.filter(a => a.tipo_acceso === 'membresia').length,
                    accesos_por_propina: accesos.filter(a => a.tipo_acceso === 'propina').length,
                    accesos_regalo: accesos.filter(a => a.tipo_acceso === 'regalo').length,
                    accesos_promocional: accesos.filter(a => a.tipo_acceso === 'promocional').length,
                    usuarios_unicos,
                    fecha_primer_acceso: fechas[0],
                    fecha_ultimo_acceso: fechas[fechas.length - 1]
                };

                return estadisticas;
            }),
            catchError(error => {
                console.error('❌ Error obteniendo estadísticas:', error);
                return of({
                    artista_id: '',
                    contenido_id: contenidoId,
                    total_accesos: 0,
                    accesos_por_membresia: 0,
                    accesos_por_propina: 0,
                    accesos_regalo: 0,
                    accesos_promocional: 0,
                    usuarios_unicos: 0
                });
            })
        );
    }

    /**
     * Compra acceso individual a un contenido
     */
    comprarAccesoIndividual(
        usuarioId: string,
        contenidoId: number,
        artistaId: string,
        metodoPago: string = 'tarjeta'
    ): Observable<{ acceso: AccesoContenido; transaccion?: any }> {
        return this.obtenerContenidoPorId(contenidoId).pipe(
            switchMap(contenido => {
                if (!contenido || !contenido.precio_individual) {
                    throw new Error('Contenido no disponible para compra individual');
                }

                // Crear transacción
                const transaccion = {
                    usuario_id: usuarioId,
                    artista_id: artistaId,
                    tipo: 'contenido_exclusivo',
                    referencia_id: contenidoId,
                    descripcion: `Acceso individual a contenido: ${contenido.descripcion}`,
                    concepto: 'Compra contenido exclusivo',
                    monto: contenido.precio_individual,
                    monto_comision: contenido.precio_individual * 0.1,
                    monto_neto: contenido.precio_individual * 0.9,
                    estado: 'procesada',
                    metodo_pago: metodoPago
                };

                return this.supabaseClient.createRecord<any>('transacciones', transaccion).pipe(
                    switchMap(transaccionCreada => {
                        // Otorgar acceso
                        const nuevoAcceso: NuevoAccesoContenido = {
                            usuario_id: usuarioId,
                            artista_id: artistaId,
                            contenido_id: contenidoId,
                            tipo_acceso: 'propina', // Usar 'propina' para compras individuales
                            fecha_expiracion: undefined, // Acceso permanente
                            metadata: {
                                transaccion_id: transaccionCreada.id,
                                metodo_pago: metodoPago
                            }
                        };

                        return this.otorgarAccesoContenido(nuevoAcceso).pipe(
                            map(acceso => ({
                                acceso,
                                transaccion: transaccionCreada
                            }))
                        );
                    })
                );
            })
        );
    }
}
