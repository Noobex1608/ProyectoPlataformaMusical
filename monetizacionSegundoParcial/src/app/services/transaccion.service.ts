import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Transaccion } from '../models/transaccion.model';

@Injectable({ providedIn: 'root' })
export class TransaccionService {
    private transacciones: Transaccion[] = [];
    private transaccionesSubject = new BehaviorSubject<Transaccion[]>([]);

    constructor() {
        // Transacciones iniciales corregidas con tipos válidos
        this.transacciones = [
            {
                id: 1,
                tipo: 'membresia',
                descripcion: 'Pago de membresía',
                monto: 10,
                fecha: new Date()
            },
            {
                id: 2,
                tipo: 'propina', // ✔️ debe coincidir con el tipo permitido
                descripcion: 'Propina al artista',
                monto: 5,
                fecha: new Date()
            }
        ];
        this.transaccionesSubject.next(this.transacciones);
    }

    obtenerTransacciones(): Observable<Transaccion[]> {
        return this.transaccionesSubject.asObservable();
    }

    agregarTransaccion(transaccion: Transaccion): void {
        const nueva: Transaccion = {
            ...transaccion,
            id: Date.now(),
            fecha: new Date()
        };
        this.transacciones.push(nueva);
        this.transaccionesSubject.next([...this.transacciones]);
    }

    eliminarTransaccion(id: number): void {
        this.transacciones = this.transacciones.filter(t => t.id !== id);
        this.transaccionesSubject.next([...this.transacciones]);
    }
}
