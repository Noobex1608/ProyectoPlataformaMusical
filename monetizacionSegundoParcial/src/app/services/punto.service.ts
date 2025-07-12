import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Punto } from '../models/sistemapuntos.model';

@Injectable({ providedIn: 'root' })
export class PuntoService {
    private puntos: Punto[] = [];
    private puntosSubject = new BehaviorSubject<Punto[]>([]);

    /**
     * Retorna los puntos en forma de Observable
     */
    obtenerPuntos(): Observable<Punto[]> {
        return this.puntosSubject.asObservable();
    }

    /**
     * Agrega un nuevo punto para un usuario
     */
    agregarPunto(punto: Punto): Observable<boolean> {
        punto.id = Math.floor(Math.random() * 100000); // ID único simulado
        this.puntos.push(punto);
        this.puntosSubject.next([...this.puntos]);
        return of(true);
    }

    /**
     * Calcula estadísticas de puntos de un usuario
     */
    calcularEstadisticas(usuarioId: number): {
        total: number;
        canjeados: number;
        disponibles: number;
    } {
        const userPuntos = this.puntos.filter(p => p.usuarioId === usuarioId);
        const total = userPuntos.reduce((acc, p) => acc + p.cantidad, 0);
        const canjeados = 800; // Valor fijo de ejemplo
        const disponibles = Math.max(0, total - canjeados);
        return { total, canjeados, disponibles };
    }
}
