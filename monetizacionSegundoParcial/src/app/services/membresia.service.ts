import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Membresia } from '../models/membresia.model';

@Injectable({
    providedIn: 'root'
})
export class MembresiaService {
    private membresias: Membresia[] = [];
    private membresiasSubject: BehaviorSubject<Membresia[]> = new BehaviorSubject<Membresia[]>([]);

    constructor() {
        this.membresias = [
            {
                id: 1,
                nombre: 'Básica',
                descripcion: 'Ideal para empezar',
                precio: 10,
                duracionDias: 30,
                beneficios: ['Acceso limitado', 'Soporte básico']
            },
            {
                id: 2,
                nombre: 'Pro',
                descripcion: 'Más beneficios y visibilidad',
                precio: 25,
                duracionDias: 60,
                beneficios: ['Acceso total', 'Soporte premium', 'Promoción especial']
            }
        ];
        this.membresiasSubject.next(this.membresias);
    }

    obtenerMembresias(): Observable<Membresia[]> {
        return this.membresiasSubject.asObservable();
    }

    agregarMembresia(membresia: Membresia): void {
        membresia.id = Date.now(); // ID único simulado
        this.membresias.push(membresia);
        this.membresiasSubject.next([...this.membresias]);
    }

    eliminarMembresia(id: number): Observable<void> {
        this.membresias = this.membresias.filter(m => m.id !== id);
        this.membresiasSubject.next([...this.membresias]);
        return of(void 0); // ✅ permite usar `.subscribe()` desde el componente
    }
}
