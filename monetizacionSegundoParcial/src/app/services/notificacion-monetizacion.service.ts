import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { NotificacionMonetizacion } from '../models/notificacion-monetizacion.model';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({ providedIn: 'root' })
export class NotificacionMonetizacionService {
    private notificacionesSubject = new BehaviorSubject<NotificacionMonetizacion[]>([]);

    constructor(private supabaseClient: SupabaseClientService) {
        this.loadNotificaciones();
    }

    private loadNotificaciones(): void {
        this.supabaseClient.getRecords<NotificacionMonetizacion>('notificaciones_monetizacion').subscribe(
            notificaciones => this.notificacionesSubject.next(notificaciones)
        );
    }

    obtenerNotificacionesPorUsuario(usuarioId: string): Observable<NotificacionMonetizacion[]> {
        return this.supabaseClient.getRecords<NotificacionMonetizacion>('notificaciones_monetizacion', { 
            usuario_id: usuarioId 
        }).pipe(
            map(notificaciones => notificaciones.sort((a, b) => 
                new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
            ))
        );
    }

    obtenerNotificacionesNoLeidas(usuarioId: string): Observable<NotificacionMonetizacion[]> {
        return this.supabaseClient.getRecords<NotificacionMonetizacion>('notificaciones_monetizacion', { 
            usuario_id: usuarioId,
            leida: false 
        });
    }

    crearNotificacion(notificacion: Omit<NotificacionMonetizacion, 'id' | 'fecha_creacion' | 'created_at'>): Observable<NotificacionMonetizacion> {
        const nuevaNotificacion = {
            ...notificacion,
            fecha_creacion: new Date().toISOString(),
            created_at: new Date().toISOString()
        };
        
        return this.supabaseClient.createRecord<NotificacionMonetizacion>('notificaciones_monetizacion', nuevaNotificacion);
    }

    marcarComoLeida(notificacionId: number): Observable<NotificacionMonetizacion> {
        return this.supabaseClient.updateRecord<NotificacionMonetizacion>(
            'notificaciones_monetizacion', 
            notificacionId, 
            { 
                leida: true,
                fecha_leida: new Date().toISOString()
            }
        );
    }

    marcarTodasComoLeidas(usuarioId: string): Observable<boolean> {
        return this.obtenerNotificacionesNoLeidas(usuarioId).pipe(
            switchMap(notificaciones => {
                if (notificaciones.length === 0) return of(true);
                
                const updates = notificaciones.map(notif => 
                    this.marcarComoLeida(notif.id)
                );
                
                // Ejecutar todas las actualizaciones en paralelo
                return Promise.all(updates.map(obs => obs.toPromise()));
            }),
            map(() => true),
            catchError(() => of(false))
        );
    }

    eliminarNotificacion(notificacionId: number): Observable<boolean> {
        return this.supabaseClient.deleteRecord('notificaciones_monetizacion', notificacionId);
    }

    crearNotificacionNuevaMembresia(
        artistaId: string, 
        fanId: string, 
        membresiaId: number,
        monto: number
    ): Observable<NotificacionMonetizacion> {
        return this.crearNotificacion({
            usuario_id: artistaId,
            tipo: 'nueva_membresia',
            titulo: 'Nueva Membresía',
            mensaje: `Tienes un nuevo fan premium. ¡Has ganado $${monto}!`,
            metadata: {
                fanId,
                membresiaId,
                monto
            },
            leida: false,
            prioridad: 'alta'
        });
    }

    crearNotificacionNuevaPropina(
        artistaId: string, 
        fanId: string, 
        monto: number,
        mensaje?: string
    ): Observable<NotificacionMonetizacion> {
        return this.crearNotificacion({
            usuario_id: artistaId,
            tipo: 'propina_recibida',
            titulo: 'Nueva Propina',
            mensaje: `Recibiste una propina de $${monto}${mensaje ? `: "${mensaje}"` : ''}`,
            metadata: {
                fanId,
                monto,
                mensajeFan: mensaje
            },
            leida: false,
            prioridad: 'media'
        });
    }

    crearNotificacionRetiroCompletado(
        artistaId: string, 
        monto: number, 
        metodoPago: string
    ): Observable<NotificacionMonetizacion> {
        return this.crearNotificacion({
            usuario_id: artistaId,
            tipo: 'contenido_nuevo',
            titulo: 'Retiro Completado',
            mensaje: `Tu retiro de $${monto} ha sido procesado exitosamente vía ${metodoPago}`,
            metadata: {
                monto,
                metodoPago
            },
            leida: false,
            prioridad: 'alta'
        });
    }

    crearNotificacionReporteMensual(artistaId: string, mes: string, ingresosTotales: number): Observable<NotificacionMonetizacion> {
        return this.crearNotificacion({
            usuario_id: artistaId,
            tipo: 'contenido_nuevo',
            titulo: 'Reporte Mensual Disponible',
            mensaje: `Tu reporte de ${mes} está listo. Ingresos totales: $${ingresosTotales}`,
            metadata: {
                mes,
                ingresosTotales
            },
            leida: false,
            prioridad: 'baja'
        });
    }

    obtenerEstadisticasNotificaciones(usuarioId: string): Observable<{
        total: number;
        noLeidas: number;
        porTipo: { [tipo: string]: number };
        porPrioridad: { [prioridad: string]: number };
    }> {
        return this.obtenerNotificacionesPorUsuario(usuarioId).pipe(
            map(notificaciones => ({
                total: notificaciones.length,
                noLeidas: notificaciones.filter(n => !n.leida).length,
                porTipo: notificaciones.reduce((tipos, n) => {
                    tipos[n.tipo] = (tipos[n.tipo] || 0) + 1;
                    return tipos;
                }, {} as { [tipo: string]: number }),
                porPrioridad: notificaciones.reduce((prioridades, n) => {
                    prioridades[n.prioridad] = (prioridades[n.prioridad] || 0) + 1;
                    return prioridades;
                }, {} as { [prioridad: string]: number })
            })),
            catchError(() => of({
                total: 0,
                noLeidas: 0,
                porTipo: {},
                porPrioridad: {}
            }))
        );
    }

    limpiarNotificacionesAntiguas(usuarioId: string, diasAntiguedad: number = 30): Observable<number> {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - diasAntiguedad);

        return this.obtenerNotificacionesPorUsuario(usuarioId).pipe(
            map(notificaciones => 
                notificaciones.filter(n => 
                    new Date(n.fecha_creacion) < fechaLimite && n.leida
                )
            ),
            switchMap(notificacionesAntiguas => {
                if (notificacionesAntiguas.length === 0) return of(0);
                
                const deletes = notificacionesAntiguas.map(notif => 
                    this.eliminarNotificacion(notif.id)
                );
                
                return Promise.all(deletes.map(obs => obs.toPromise())).then(() => notificacionesAntiguas.length);
            }),
            catchError(() => of(0))
        );
    }
}
