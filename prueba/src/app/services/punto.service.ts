import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Punto } from '../models/sistema-de-puntos.model';

@Injectable({
    providedIn: 'root'
})
export class PuntosService {
    private puntos: Punto[] = [
        {
            cantidad: 10,
            motivo: 'Registro inicial',
            fecha: new Date(),
            usuarioId: 'user1'
        },
        {
            cantidad: 20,
            motivo: 'Bonus mensual',
            fecha: new Date(),
            usuarioId: 'user2'
        },
        {
            cantidad: 50,
            motivo: 'Recompensa especial',
            fecha: new Date(),
            usuarioId: 'user3'
        }
    ];

    private puntosSubject = new BehaviorSubject<Punto[]>([...this.puntos]);

    obtenerTodos(): Observable<Punto[]> {
        return this.puntosSubject.asObservable();
    }

    agregarPuntos(punto: Punto): void {
        const nuevoPunto: Punto = {
            ...punto,
            fecha: new Date()
        };
        this.puntos.push(nuevoPunto);
        this.puntosSubject.next([...this.puntos]);
    }

    resetearPuntos(): void {
        this.puntos = [];
        this.puntosSubject.next([]);
    }
}
