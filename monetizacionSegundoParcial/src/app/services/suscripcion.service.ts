// src/app/services/suscripcion.service.ts
import { Injectable } from '@angular/core';
import { Observable, map, of, combineLatest } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SuscripcionUsuario, SuscripcionConDetalles, ResumenSuscripciones, Suscripcion } from '../models/suscripcion.model';
import { SupabaseClientService } from './supabase-client.service';
import { Artista } from '../models/artista.model';
import { Membresia } from '../models/membresia.model';

@Injectable({ providedIn: 'root' })
export class SuscripcionService {

    constructor(private supabaseClient: SupabaseClientService) {}

    /**
     * Obtiene todas las suscripciones de un usuario con detalles completos
     */
    obtenerSuscripcionesUsuario(usuarioId: string): Observable<SuscripcionConDetalles[]> {
        console.log('🔍 Obteniendo suscripciones para usuario:', usuarioId);

        return combineLatest([
            this.obtenerSuscripcionesBasicas(usuarioId),
            this.obtenerArtistas(),
            this.obtenerMembresias()
        ]).pipe(
            map(([suscripciones, artistas, membresias]) => {
                console.log('📊 Datos obtenidos:', {
                    suscripciones: suscripciones.length,
                    artistas: artistas.length,
                    membresias: membresias.length
                });

                return suscripciones.map(suscripcion => {
                    const artista = artistas.find(a => a.id === suscripcion.artista_id);
                    const membresia = membresias.find(m => m.id === parseInt(suscripcion.membresia_id, 10));
                    
                    const fechaFin = new Date(suscripcion.fecha_fin);
                    const ahora = new Date();
                    const diasRestantes = Math.max(0, Math.ceil((fechaFin.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24)));
                    
                    let estadoRenovacion: 'activa' | 'vencida' | 'por_vencer' | 'cancelada';
                    if (!suscripcion.activa) {
                        estadoRenovacion = 'cancelada';
                    } else if (diasRestantes <= 0) {
                        estadoRenovacion = 'vencida';
                    } else if (diasRestantes <= 7) {
                        estadoRenovacion = 'por_vencer';
                    } else {
                        estadoRenovacion = 'activa';
                    }

                    return {
                        // Propiedades del modelo Suscripcion local
                        id: parseInt(suscripcion.id, 10),
                        usuarioId: parseInt(suscripcion.usuario_id, 10),
                        membresiaId: parseInt(suscripcion.membresia_id, 10),
                        artistaId: suscripcion.artista_id,
                        fechaInicio: new Date(suscripcion.fecha_inicio),
                        fechaFin: new Date(suscripcion.fecha_fin),
                        activa: suscripcion.activa,
                        renovacionAutomatica: suscripcion.renovacion_automatica,
                        estadoPago: suscripcion.estado_pago as 'pendiente' | 'pagado' | 'cancelado' | 'vencido',
                        metodoPago: suscripcion.metodo_pago,
                        montoTotal: suscripcion.monto_total,
                        montoComision: suscripcion.monto_comision,
                        montoNeto: suscripcion.monto_neto,
                        transaccionId: suscripcion.transaccion_id,
                        fechaCancelacion: suscripcion.fecha_cancelacion ? new Date(suscripcion.fecha_cancelacion) : undefined,
                        motivoCancelacion: suscripcion.motivo_cancelacion,
                        beneficiosUsados: suscripcion.beneficios_usados || {
                            fotosExclusivas: 0,
                            avancesCanciones: 0,
                            mensajesPrivados: 0
                        },
                        // Propiedades adicionales con detalles
                        artista: {
                            id: artista?.id || suscripcion.artista_id,
                            nombre: artista?.nombre || 'Artista Desconocido',
                            imagen_perfil: artista?.imagen
                        },
                        plan: {
                            id: membresia?.id || parseInt(suscripcion.membresia_id, 10),
                            nombre: membresia?.nombre || 'Membresía Desconocida',
                            precio: membresia?.precio || 0,
                            descripcion: membresia?.descripcion,
                            beneficios: membresia?.beneficios || []
                        }
                    } as SuscripcionConDetalles;
                });
            }),
            catchError(error => {
                console.error('❌ Error obteniendo suscripciones:', error);
                return of([]);
            })
        );
    }

    /**
     * Obtiene las suscripciones básicas desde la base de datos
     */
    private obtenerSuscripcionesBasicas(usuarioId: string): Observable<SuscripcionUsuario[]> {
        return this.supabaseClient.getRecords<SuscripcionUsuario>('suscripciones_usuario', {
            usuario_id: usuarioId
        }).pipe(
            catchError(error => {
                console.warn('⚠️ Error obteniendo suscripciones básicas:', error);
                return of([]);
            })
        );
    }

    /**
     * Obtiene la lista de artistas
     */
    private obtenerArtistas(): Observable<Artista[]> {
        return this.supabaseClient.getRecords<Artista>('artistas').pipe(
            catchError(error => {
                console.warn('⚠️ Error obteniendo artistas:', error);
                return of([]);
            })
        );
    }

    /**
     * Obtiene la lista de membresías
     */
    private obtenerMembresias(): Observable<Membresia[]> {
        return this.supabaseClient.getRecords<Membresia>('membresias').pipe(
            catchError(error => {
                console.warn('⚠️ Error obteniendo membresías:', error);
                return of([]);
            })
        );
    }

    /**
     * Cancela una suscripción
     */
    cancelarSuscripcion(suscripcionId: number): Observable<boolean> {
        console.log('🚫 Cancelando suscripción:', suscripcionId);
        
        return this.supabaseClient.updateRecord<SuscripcionUsuario>('suscripciones_usuario', suscripcionId, {
            activa: false,
            renovacion_automatica: false
        }).pipe(
            map(result => {
                console.log('✅ Suscripción cancelada exitosamente');
                return true;
            }),
            catchError(error => {
                console.error('❌ Error cancelando suscripción:', error);
                return of(false);
            })
        );
    }

    /**
     * Activa/desactiva la renovación automática
     */
    toggleRenovacionAutomatica(suscripcionId: number, activar: boolean): Observable<boolean> {
        console.log('🔄 Toggle renovación automática:', { suscripcionId, activar });
        
        return this.supabaseClient.updateRecord<SuscripcionUsuario>('suscripciones_usuario', suscripcionId, {
            renovacion_automatica: activar
        }).pipe(
            map(result => {
                console.log(`✅ Renovación automática ${activar ? 'activada' : 'desactivada'}`);
                return true;
            }),
            catchError(error => {
                console.error('❌ Error toggling renovación automática:', error);
                return of(false);
            })
        );
    }

    /**
     * Calcula el resumen de suscripciones
     */
    calcularResumen(suscripciones: SuscripcionConDetalles[]): ResumenSuscripciones {
        const activas = suscripciones.filter(s => s.activa);
        const gastoMensual = activas.reduce((total, s) => {
            return total + s.plan.precio; // Asumiendo que el precio ya es mensual
        }, 0);
        
        // Calcular próximas renovaciones (dentro de 7 días)
        const ahora = new Date();
        const proximasRenovaciones = suscripciones.filter(s => {
            if (!s.activa || !s.renovacionAutomatica) return false;
            const diasHastaRenovacion = Math.ceil((s.fechaFin.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
            return diasHastaRenovacion <= 7 && diasHastaRenovacion > 0;
        }).length;
        
        const totalGastado = suscripciones.reduce((total, s) => total + s.montoTotal, 0);

        return {
            total: suscripciones.length,
            activas: activas.length,
            inactivas: suscripciones.length - activas.length,
            gastoMensual: Number(gastoMensual.toFixed(2))
        };
    }

    /**
     * Obtiene suscripciones activas para un artista específico
     */
    obtenerPorArtista(artistaId: string): Observable<SuscripcionUsuario[]> {
        return this.supabaseClient.getRecords<SuscripcionUsuario>('suscripciones_usuario', { 
            artista_id: artistaId,
            activa: true 
        }).pipe(
            catchError(error => {
                console.warn('⚠️ Error obteniendo suscripciones por artista:', error);
                return of([]);
            })
        );
    }

    /**
     * Verifica si un usuario tiene suscripción activa con un artista
     */
    verificarSuscripcionActiva(usuarioId: string, artistaId: string): Observable<SuscripcionUsuario | null> {
        return this.supabaseClient.getRecords<SuscripcionUsuario>('suscripciones_usuario', { 
            usuario_id: usuarioId,
            artista_id: artistaId,
            activa: true 
        }).pipe(
            map(suscripciones => {
                const activa = suscripciones.find(s => new Date(s.fecha_fin) > new Date());
                return activa || null;
            }),
            catchError(error => {
                console.warn('⚠️ Error verificando suscripción activa:', error);
                return of(null);
            })
        );
    }

    /**
     * Obtiene suscripciones simples (para compatibilidad con monetizacion.component)
     */
    obtenerSuscripciones(): Observable<Suscripcion[]> {
        // Método de compatibilidad - se puede mejorar después
        return of([]);
    }

    /**
     * Crea una nueva suscripción (para compatibilidad con monetizacion.component)
     */
    crearSuscripcion(suscripcion: Suscripcion): Observable<boolean> {
        console.log('🔄 Creando suscripción:', suscripcion);
        
        const suscripcionDB: Partial<SuscripcionUsuario> = {
            usuario_id: suscripcion.usuarioId.toString(),
            membresia_id: suscripcion.membresiaId.toString(),
            artista_id: suscripcion.artistaId,
            fecha_inicio: suscripcion.fechaInicio.toISOString(),
            fecha_fin: suscripcion.fechaFin.toISOString(),
            activa: suscripcion.activa,
            renovacion_automatica: suscripcion.renovacionAutomatica,
            estado_pago: suscripcion.estadoPago,
            metodo_pago: suscripcion.metodoPago,
            monto_total: suscripcion.montoTotal,
            monto_comision: suscripcion.montoComision,
            monto_neto: suscripcion.montoNeto,
            transaccion_id: suscripcion.transaccionId,
            beneficios_usados: {
                fotos_exclusivas: suscripcion.beneficiosUsados.fotosExclusivas,
                avances_canciones: suscripcion.beneficiosUsados.avancesCanciones,
                mensajes_privados: suscripcion.beneficiosUsados.mensajesPrivados
            }
        };

        return this.supabaseClient.createRecord<SuscripcionUsuario>('suscripciones_usuario', suscripcionDB).pipe(
            map(result => {
                console.log('✅ Suscripción creada exitosamente');
                return true;
            }),
            catchError(error => {
                console.error('❌ Error creando suscripción:', error);
                return of(false);
            })
        );
    }
}
