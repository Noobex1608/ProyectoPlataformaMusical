import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Recompensa } from '../models/recompensa.model';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({ providedIn: 'root' })
export class RecompensaService {
    private recompensasSubject = new BehaviorSubject<Recompensa[]>([]);

    constructor(private supabaseClient: SupabaseClientService) {
        this.loadRecompensas();
    }

    private loadRecompensas(): void {
        this.supabaseClient.getRecords<Recompensa>('recompensas').subscribe(
            recompensas => this.recompensasSubject.next(recompensas)
        );
    }

    obtenerRecompensas(): Observable<Recompensa[]> {
        return this.recompensasSubject.asObservable();
    }

    obtenerRecompensasPorArtista(artistaId: string): Observable<Recompensa[]> {
        return this.supabaseClient.getRecords<Recompensa>('recompensas', { 
            artista_id: artistaId,
            activa: true 
        });
    }

    obtenerRecompensaPorId(id: number): Observable<Recompensa | null> {
        return this.supabaseClient.getRecordById<Recompensa>('recompensas', id);
    }

    agregarRecompensa(recompensa: Omit<Recompensa, 'id' | 'created_at' | 'updated_at'>): Observable<Recompensa> {
        const nuevaRecompensa = {
            ...recompensa,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        return this.supabaseClient.createRecord<Recompensa>('recompensas', nuevaRecompensa);
    }

    actualizarRecompensa(id: number, datos: Partial<Recompensa>): Observable<Recompensa> {
        return this.supabaseClient.updateRecord<Recompensa>('recompensas', id, {
            ...datos,
            updated_at: new Date().toISOString()
        });
    }

    eliminarRecompensa(id: number): Observable<Recompensa> {
        return this.supabaseClient.updateRecord<Recompensa>('recompensas', id, { 
            activa: false,
            updated_at: new Date().toISOString()
        });
    }

    comprarRecompensa(recompensaId: number, usuarioId: string): Observable<boolean> {
        // Incrementar cantidad_vendida
        return this.supabaseClient.getRecordById<Recompensa>('recompensas', recompensaId).pipe(
            map(recompensa => {
                if (!recompensa) throw new Error('Recompensa no encontrada');
                
                if (recompensa.cantidad_disponible && 
                    recompensa.cantidad_vendida >= recompensa.cantidad_disponible) {
                    throw new Error('Recompensa agotada');
                }
                
                // Actualizar cantidad vendida
                this.supabaseClient.updateRecord<Recompensa>('recompensas', recompensaId, {
                    cantidad_vendida: recompensa.cantidad_vendida + 1,
                    updated_at: new Date().toISOString()
                }).subscribe();
                
                return true;
            }),
            catchError(error => {
                console.error('Error comprando recompensa:', error);
                return of(false);
            })
        );
    }
}
