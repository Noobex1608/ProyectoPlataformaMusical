import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Recompensa } from '../models/recompensa.model';

@Injectable({ providedIn: 'root' })
export class RecompensaService {
    private recompensas: Recompensa[] = [
        {
            id: 1,
            titulo: 'Sticker exclusivo',
            descripcion: 'Un sticker digital exclusivo del artista.',
            puntosRequeridos: 100
        },
        {
            id: 2,
            titulo: 'Acceso a contenido VIP',
            descripcion: 'Videos y demos inéditos.',
            puntosRequeridos: 250
        }
    ];

    private recompensasSubject = new BehaviorSubject<Recompensa[]>(this.recompensas);

    obtenerRecompensas(): Observable<Recompensa[]> {
        return this.recompensasSubject.asObservable();
    }

    agregarRecompensa(recompensa: Recompensa): void {
        recompensa.id = Date.now(); // ID temporal
        this.recompensas.push(recompensa);
        this.recompensasSubject.next(this.recompensas);
    }

    eliminarRecompensa(id: number): void {
        this.recompensas = this.recompensas.filter(r => r.id !== id);
        this.recompensasSubject.next(this.recompensas);
    }
}
