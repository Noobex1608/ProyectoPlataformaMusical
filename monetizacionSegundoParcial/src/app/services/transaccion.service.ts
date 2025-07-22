import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Transaccion } from '../models/transaccion.model';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({ providedIn: 'root' })
export class TransaccionService {
    private transaccionesSubject = new BehaviorSubject<Transaccion[]>([]);

    constructor(private supabaseClient: SupabaseClientService) {
        this.loadTransacciones();
    }

    private loadTransacciones(): void {
        this.supabaseClient.getRecords<Transaccion>('transacciones').subscribe(
            transacciones => this.transaccionesSubject.next(transacciones)
        );
    }

    obtenerTransacciones(): Observable<Transaccion[]> {
        return this.transaccionesSubject.asObservable();
    }

    obtenerTransaccionesPorUsuario(usuarioId: string): Observable<Transaccion[]> {
        return this.supabaseClient.getRecords<Transaccion>('transacciones', { 
            usuario_id: usuarioId 
        });
    }

    obtenerTransaccionesPorArtista(artistaId: string): Observable<Transaccion[]> {
        return this.supabaseClient.getRecords<Transaccion>('transacciones', { 
            artista_id: artistaId 
        });
    }

    crearTransaccion(transaccion: Omit<Transaccion, 'id' | 'fecha' | 'created_at'>): Observable<Transaccion> {
        const nuevaTransaccion = {
            ...transaccion,
            fecha: new Date().toISOString(),
            created_at: new Date().toISOString()
        };
        
        return this.supabaseClient.createRecord<Transaccion>('transacciones', nuevaTransaccion);
    }

    actualizarEstadoTransaccion(id: number, estado: Transaccion['estado'], fechaProcesamiento?: string): Observable<Transaccion> {
        const updateData: Partial<Transaccion> = {
            estado,
            fecha_procesamiento: fechaProcesamiento || new Date().toISOString()
        };
        
        return this.supabaseClient.updateRecord<Transaccion>('transacciones', id, updateData);
    }

    obtenerEstadisticasTransacciones(artistaId: string): Observable<{
        totalIngresos: number;
        transaccionesPendientes: number;
        transaccionesDelMes: number;
        comisionesTotales: number;
        transaccionesPorTipo: { [key: string]: number };
    }> {
        return this.supabaseClient.getRecords<Transaccion>('transacciones', { 
            artista_id: artistaId 
        }).pipe(
            map(transacciones => {
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                
                const transaccionesPorTipo = transacciones.reduce((acc, t) => {
                    acc[t.tipo] = (acc[t.tipo] || 0) + 1;
                    return acc;
                }, {} as { [key: string]: number });
                
                return {
                    totalIngresos: transacciones
                        .filter(t => t.estado === 'procesada')
                        .reduce((total, t) => total + t.monto_neto, 0),
                    transaccionesPendientes: transacciones.filter(t => t.estado === 'pendiente').length,
                    transaccionesDelMes: transacciones.filter(t => {
                        const transactionDate = new Date(t.fecha);
                        return transactionDate.getMonth() === currentMonth && 
                               transactionDate.getFullYear() === currentYear;
                    }).length,
                    comisionesTotales: transacciones
                        .filter(t => t.estado === 'procesada')
                        .reduce((total, t) => total + t.monto_comision, 0),
                    transaccionesPorTipo
                };
            }),
            catchError(error => {
                console.error('Error obteniendo estadísticas de transacciones:', error);
                return of({
                    totalIngresos: 0,
                    transaccionesPendientes: 0,
                    transaccionesDelMes: 0,
                    comisionesTotales: 0,
                    transaccionesPorTipo: {}
                });
            })
        );
    }

    obtenerTransaccionPorId(id: number): Observable<Transaccion | null> {
        return this.supabaseClient.getRecordById<Transaccion>('transacciones', id);
    }

    obtenerTransaccionesPorTipo(tipo: Transaccion['tipo'], artistaId?: string): Observable<Transaccion[]> {
        const filtros: any = { tipo };
        if (artistaId) {
            filtros.artista_id = artistaId;
        }
        
        return this.supabaseClient.getRecords<Transaccion>('transacciones', filtros);
    }

    obtenerHistorialTransacciones(usuarioId: string, limite?: number): Observable<Transaccion[]> {
        return this.supabaseClient.getRecords<Transaccion>('transacciones', { 
            usuario_id: usuarioId 
        }).pipe(
            map(transacciones => {
                const sorted = transacciones.sort((a, b) => 
                    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
                );
                
                return limite ? sorted.slice(0, limite) : sorted;
            })
        );
    }
}