import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Membresia } from '../models/membresia.model';
import {  of } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class MembresiaService {
    private membresias: Membresia[] = [
        {
            id: 1,
            nombre: 'Básica',
            descripcion: 'Acceso limitado',
            precio: 5,
            duracionDias: 30,
            beneficios: ['Acceso básico a canciones']
        },
        {
            id: 2,
            nombre: 'Premium',
            descripcion: 'Acceso total y contenido exclusivo',
            precio: 10,
            duracionDias: 90,
            beneficios: ['Contenido exclusivo', 'Canciones anticipadas']
        }
    ];

    private membresiasSubject = new BehaviorSubject<Membresia[]>(this.membresias);

    obtenerMembresias(): Observable<Membresia[]> {
        return this.membresiasSubject.asObservable();
    }

    agregarMembresia(m: Membresia): void {
        m.id = Date.now();
        this.membresias.push(m);
        this.membresiasSubject.next([...this.membresias]);
    }

    eliminarMembresia(id: number): Observable<boolean> {
        this.membresias = this.membresias.filter((m: Membresia) => m.id !== id);
        this.membresiasSubject.next([...this.membresias]);
        return of(true);
    }
}