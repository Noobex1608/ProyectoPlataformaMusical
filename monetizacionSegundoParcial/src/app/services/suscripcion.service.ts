// src/app/services/suscripcion.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Suscripcion } from '../models/suscripcion.model';

@Injectable({ providedIn: 'root' })
export class SuscripcionService {
    private suscripciones: Suscripcion[] = [];

    private suscripcionesSubject = new BehaviorSubject<Suscripcion[]>(this.suscripciones);

    obtenerSuscripciones(): Observable<Suscripcion[]> {
        return this.suscripcionesSubject.asObservable();
    }

    agregarSuscripcion(suscripcion: Suscripcion): Observable<void> {
        suscripcion.id = Date.now();
        suscripcion.fechaInicio = new Date();
        this.suscripciones.push(suscripcion);
        this.suscripcionesSubject.next([...this.suscripciones]);
        return of();
    }

    obtenerPorUsuario(usuarioId: number): Suscripcion[] {
        return this.suscripciones.filter(s => s.usuarioId === usuarioId);
    }
}
