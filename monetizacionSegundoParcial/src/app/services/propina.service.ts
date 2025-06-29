import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Propina } from '../models/propina.model';

@Injectable({ providedIn: 'root' })
export class PropinaService {
    private propinas: Propina[] = [];
    private propinasSubject: BehaviorSubject<Propina[]> = new BehaviorSubject<Propina[]>([]);

    constructor() {
        this.propinas = [
            {
                id: 1,
                nombreFan: 'Laura',
                monto: 5,
                mensaje: 'Gracias por tu música',
                fecha: new Date('2024-05-01')
            },
            {
                id: 2,
                nombreFan: 'Carlos',
                monto: 10,
                mensaje: 'Eres genial, sigue así',
                fecha: new Date('2024-05-10')
            }
        ];
    

        this.propinasSubject.next(this.propinas);
    }

    obtenerPropinas(): Observable<Propina[]> {
        return this.propinasSubject.asObservable();
    }

    agregarPropina(propina: Propina): void {
        const nueva: Propina = {
            ...propina,
            id: Date.now(),
            fecha: new Date()
        };
        this.propinas.push(nueva);
        this.propinasSubject.next([...this.propinas]);
    }

    eliminarPropina(id: number): void {
        this.propinas = this.propinas.filter(p => p.id !== id);
        this.propinasSubject.next([...this.propinas]);
    }
}
