import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Transaccion } from '../models/transaccion.model';
import { Propina } from '../models/propina.model';
import { Membresia } from '../models/membresia.model';

@Injectable({ providedIn: 'root' })
export class TransaccionService {
    private transacciones: Transaccion[] = [];
    private transaccionesSubject = new BehaviorSubject<Transaccion[]>([]);

    constructor() {
        const membresiaEjemplo: Membresia = {
            id: 1,
            nombre: 'Membresía Básica',
            descripcion: 'Acceso a contenido exclusivo',
            precio: 10,
            duracionDias: 30,
            beneficios: ['beneficio1', 'beneficio2']
        };

        const propinaEjemplo: Propina = {
            id: 2,
            artistaId: 1,
            usuarioId: 2,
            cantidad: 5,
            fecha: new Date(),
            mensaje: ''
        };

        this.transacciones = [
            {
                id: 1,
                tipo: membresiaEjemplo,
                descripcion: 'Compra de membresía',
                monto: membresiaEjemplo.precio,
                fecha: new Date()
            },
            {
                id: 2,
                tipo: propinaEjemplo,
                descripcion: 'Propina enviada',
                monto: propinaEjemplo.cantidad,
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
