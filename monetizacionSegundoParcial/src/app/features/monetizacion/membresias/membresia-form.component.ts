import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Membresia {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    duracionDias: number;
}

@Injectable({
    providedIn: 'root'
})
export class MembresiaFormComponent {
    private membresias: Membresia[] = [];
    private membresiasSubject = new BehaviorSubject<Membresia[]>([]);

    obtenerMembresias(): Observable<Membresia[]> {
        return this.membresiasSubject.asObservable();
    }

    agregarMembresia(membresia: Membresia): void {
        membresia.id = Date.now();
        this.membresias.push(membresia);
        this.membresiasSubject.next(this.membresias);
    }

    eliminarMembresia(id: number): void {
        this.membresias = this.membresias.filter(m => m.id !== id);
        this.membresiasSubject.next(this.membresias);
    }
}
