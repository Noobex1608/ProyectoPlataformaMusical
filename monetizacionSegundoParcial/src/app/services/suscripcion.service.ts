// src/app/services/suscripcion.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Suscripcion } from '../models/suscripcion.model';

@Injectable({ providedIn: 'root' })
export class SuscripcionService {
    private suscripciones: Suscripcion[] = [];
    private suscripcionesSubject = new BehaviorSubject<Suscripcion[]>([]);

    obtenerSuscripciones(): Observable<Suscripcion[]> {
        return this.suscripcionesSubject.asObservable();
    }

    agregarSuscripcion(suscripcion: Suscripcion): Observable<Suscripcion> {
        suscripcion.id = Date.now(); // ID único temporal
        this.suscripciones.push(suscripcion);
        this.suscripcionesSubject.next([...this.suscripciones]);
        return of(suscripcion); // ← Aquí devuelves la suscripción real
    }
}
