// src/app/services/recompensa.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Recompensa } from '../models/recompensa.model';

@Injectable({ providedIn: 'root' })
export class RecompensaService {
    private recompensas: Recompensa[] = [
        {
            id: 1,
            nombre: 'Sticker digital',
            descripcion: 'Recibe un sticker exclusivo del artista',
            tipo: 'Digital',
            valorMinimo: 10,
            puntos: 100
        },
        {
            id: 2,
            nombre: 'Video personalizado',
            descripcion: 'El artista te graba un saludo',
            tipo: 'Video',
            valorMinimo: 50,
            puntos: 500
        }
    ];

    private recompensasSubject = new BehaviorSubject<Recompensa[]>([...this.recompensas]);

    obtenerRecompensas(): Observable<Recompensa[]> {
        return this.recompensasSubject.asObservable();
    }

    agregarRecompensa(r: Recompensa): Observable<void> {
        const nuevaRecompensa: Recompensa = {
            ...r,
            id: Date.now()
        };
        this.recompensas.push(nuevaRecompensa);
        this.recompensasSubject.next([...this.recompensas]);
        return of();
    }

    eliminarRecompensa(id: number): Observable<void> {
        this.recompensas = this.recompensas.filter(r => r.id !== id);
        this.recompensasSubject.next([...this.recompensas]);
        return of();
    }
}
