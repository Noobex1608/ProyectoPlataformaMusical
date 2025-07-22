import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Propina } from '../models/propina.model';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({ providedIn: 'root' })
export class PropinaService {
    private propinasSubject = new BehaviorSubject<Propina[]>([]);

    constructor(private supabaseClient: SupabaseClientService) {
        this.loadPropinas();
    }

    private loadPropinas(): void {
        this.supabaseClient.getRecords<Propina>('propinas').subscribe(
            propinas => this.propinasSubject.next(propinas)
        );
    }

    obtenerPropinas(): Observable<Propina[]> {
        return this.propinasSubject.asObservable();
    }

    obtenerPropinasPorArtista(artistaId: string): Observable<Propina[]> {
        return this.supabaseClient.getRecords<Propina>('propinas', { 
            artista_id: artistaId 
        });
    }

    obtenerPropinasPorFan(fanId: string): Observable<Propina[]> {
        return this.supabaseClient.getRecords<Propina>('propinas', { 
            fan_id: fanId 
        });
    }

    enviarPropina(propina: Omit<Propina, 'id' | 'fecha' | 'estado' | 'comision' | 'monto_neto' | 'created_at'>): Observable<Propina> {
        const nuevaPropina = {
            ...propina,
            fecha: new Date().toISOString(),
            estado: 'pendiente' as const,
            // La comisión y monto neto se calculan automáticamente por el trigger de la DB
            created_at: new Date().toISOString()
        };
        
        return this.supabaseClient.createRecord<Propina>('propinas', nuevaPropina);
    }

    procesarPropina(id: number): Observable<Propina> {
        return this.supabaseClient.updateRecord<Propina>('propinas', id, {
            estado: 'procesada'
        });
    }

    obtenerEstadisticasPropinas(artistaId: string): Observable<{
        totalRecaudado: number;
        propinasPendientes: number;
        propinasDelMes: number;
        comisionTotal: number;
    }> {
        return this.supabaseClient.getRecords<Propina>('propinas', { 
            artista_id: artistaId 
        }).pipe(
            map(propinas => {
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                
                return {
                    totalRecaudado: propinas.reduce((total, p) => total + p.monto_neto, 0),
                    propinasPendientes: propinas.filter(p => p.estado === 'pendiente').length,
                    propinasDelMes: propinas.filter(p => {
                        const propinaDate = new Date(p.fecha);
                        return propinaDate.getMonth() === currentMonth && 
                               propinaDate.getFullYear() === currentYear;
                    }).length,
                    comisionTotal: propinas.reduce((total, p) => total + p.comision, 0)
                };
            }),
            catchError(error => {
                console.error('Error obteniendo estadísticas de propinas:', error);
                return of({
                    totalRecaudado: 0,
                    propinasPendientes: 0,
                    propinasDelMes: 0,
                    comisionTotal: 0
                });
            })
        );
    }

    actualizarEstadoPropina(id: number, estado: 'pendiente' | 'procesada' | 'rechazada'): Observable<Propina> {
        return this.supabaseClient.updateRecord<Propina>('propinas', id, { estado });
    }

    obtenerPropinaPorId(id: number): Observable<Propina | null> {
        return this.supabaseClient.getRecordById<Propina>('propinas', id);
    }
}