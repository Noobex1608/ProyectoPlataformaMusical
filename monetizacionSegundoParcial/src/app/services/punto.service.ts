import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SistemaPuntos } from '../models/sistemapuntos.model';
import { of } from 'rxjs'; 

@Injectable({ providedIn: 'root' })
export class PuntosService {
    private puntosPorUsuario: SistemaPuntos[] = [
        { usuarioId: 201, puntos: 50 },
        { usuarioId: 202, puntos: 30 }
    ];

    private puntosSubject = new BehaviorSubject<SistemaPuntos[]>(this.puntosPorUsuario);

    obtenerPuntos(): Observable<SistemaPuntos[]> {
        return this.puntosSubject.asObservable();
    }

    obtenerPuntosDeUsuario(usuarioId: number): number {
        const usuario = this.puntosPorUsuario.find(u => u.usuarioId === usuarioId);
        return usuario ? usuario.puntos : 0;
    }

    agregarPuntos(usuarioId: number, cantidad: number): Observable<boolean> {
        const usuario = this.puntosPorUsuario.find(u => u.usuarioId === usuarioId);
        if (usuario) {
            usuario.puntos += cantidad;
        } else {
            this.puntosPorUsuario.push({ usuarioId, puntos: cantidad });
        }
        this.puntosSubject.next([...this.puntosPorUsuario]);
        return of(true); // ✅ devuelve un Observable
    }
    restarPuntos(usuarioId: number, cantidad: number): Observable<boolean> {
        const usuario = this.puntosPorUsuario.find(u => u.usuarioId === usuarioId);
        if (usuario && usuario.puntos >= cantidad) {
            usuario.puntos -= cantidad;
            this.puntosSubject.next([...this.puntosPorUsuario]);
            return of(true);
        }
        return of(false); // devuelve false si no tenía suficientes
    }
    

    resetearPuntos(usuarioId: number): Observable<boolean> {
        const usuario = this.puntosPorUsuario.find(u => u.usuarioId === usuarioId);
        if (usuario) {
            usuario.puntos = 0;
            this.puntosSubject.next([...this.puntosPorUsuario]);
            return of(true);
        }
        return of(false);
    }
    
    }

