import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Membresia } from '../models/membresia.model';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({ providedIn: 'root' })
export class MembresiaService {
    private membresiasSubject = new BehaviorSubject<Membresia[]>([]);

    constructor(private supabaseClient: SupabaseClientService) {
        this.loadMembresias();
    }

    private loadMembresias(): void {
        this.supabaseClient.getRecords<Membresia>('membresias').subscribe(
            membresias => this.membresiasSubject.next(membresias)
        );
    }

    obtenerMembresias(): Observable<Membresia[]> {
        return this.membresiasSubject.asObservable();
    }

    obtenerMembresiasPorArtista(artistaId: string): Observable<Membresia[]> {
        return this.supabaseClient.getRecords<Membresia>('membresias', { 
            artista_id: artistaId, 
            activa: true 
        });
    }

    obtenerMembresiaPorId(id: number): Observable<Membresia | null> {
        return this.supabaseClient.getRecordById<Membresia>('membresias', id);
    }

    agregarMembresia(m: Omit<Membresia, 'id' | 'created_at' | 'updated_at'>): Observable<Membresia> {
        const nuevaMembresia = {
            ...m,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        return this.supabaseClient.createRecord<Membresia>('membresias', nuevaMembresia);
    }

    eliminarMembresia(id: number): Observable<Membresia> {
        return this.supabaseClient.updateRecord<Membresia>('membresias', id, { 
            activa: false,
            updated_at: new Date().toISOString()
        });
    }

    actualizarMembresia(id: number, datos: Partial<Membresia>): Observable<Membresia> {
        return this.supabaseClient.updateRecord<Membresia>('membresias', id, {
            ...datos,
            updated_at: new Date().toISOString()
        });
    }

    verificarPrivilegios(membresiaId: number, privilegio: string): Observable<boolean> {
        return this.supabaseClient.getRecordById<Membresia>('membresias', membresiaId).pipe(
            map(membresia => {
                if (!membresia?.beneficios) return false;
                
                // Verificar si existe el privilegio en los beneficios JSON
                try {
                    const privilegios = typeof membresia.beneficios === 'string' 
                        ? JSON.parse(membresia.beneficios) 
                        : membresia.beneficios;
                    
                    return privilegios && privilegios[privilegio] === true;
                } catch (error) {
                    console.error('Error parsing beneficios:', error);
                    return false;
                }
            }),
            catchError(() => of(false))
        );
    }
}