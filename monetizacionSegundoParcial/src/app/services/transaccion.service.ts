import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Transaccion } from '../models/transaccion.model';
import { Membresia } from '../models/membresia.model';
import { Propina } from '../models/propina.model';

@Injectable({ providedIn: 'root' })
export class TransaccionService {
    private transacciones: Transaccion[] = [];

    private transaccionesSubject = new BehaviorSubject<Transaccion[]>([]);

    constructor() {
        const membresiaEjemplo: Membresia = {
            id: 1,
            nombre: 'Premium',
            descripcion: 'Acceso total',
            precio: 10,
            duracionDias: 90,
            beneficios: ['Beneficio 1', 'Beneficio 2']
        };

        const propinaEjemplo: Propina = {
            id: 2,
            artistaId: 101,
            usuarioId: 201,
            monto: 5,
            fecha: new Date(),
            nombreFan: 'Laura',
            mensaje: 'Sigue así 🎶',
            cantidad: 5
        };

        this.transacciones = [
            {
                id: 1,
                usuarioId: 201,
                usuario: { id: 201, nombre: 'Ana' },
                tipo: membresiaEjemplo,
                descripcion: 'Suscripción a membresía',
                monto: membresiaEjemplo.precio,
                fecha: new Date()
            },
            {
                id: 2,
                usuarioId: 201,
                usuario: { id: 201, nombre: 'Laura' },
                tipo: propinaEjemplo,
                descripcion: 'Propina enviada',
                monto: propinaEjemplo.monto,
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
