// src/app/services/membresia.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Membresia } from '../models/membresia.model';

@Injectable({ providedIn: 'root' })
export class MembresiaService {
    private membresias: Membresia[] = [
        {
            id: 1,
            nombre: 'Premium',
            descripcion: 'Acceso ilimitado a todas las funciones',
            precio: 9.99,
            duracionDias: 30,
            beneficios: ['Sin anuncios', 'Contenido exclusivo', 'Descargas']
        },
        {
            id: 2,
            nombre: 'Básica',
            descripcion: 'Acceso limitado a funciones principales',
            precio: 4.99,
            duracionDias: 15,
            beneficios: ['Acceso a música básica']
        }
    ];

    private membresiasSubject = new BehaviorSubject<Membresia[]>(this.membresias);

    obtenerMembresias(): Observable<Membresia[]> {
        return this.membresiasSubject.asObservable();
    }

    agregarMembresia(membresia: Membresia): Observable<any> {
        membresia.id = Math.floor(Math.random() * 10000); // ID aleatorio temporal
        this.membresias.push(membresia);
        this.membresiasSubject.next([...this.membresias]);
        return of(true);
    }

    eliminarMembresia(id: number): Observable<any> {
        this.membresias = this.membresias.filter(m => m.id !== id);
        this.membresiasSubject.next([...this.membresias]);
        return of(true);
    }
}
