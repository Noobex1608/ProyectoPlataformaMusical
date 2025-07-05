import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Propina } from '../models/propina.model';
import { of } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class PropinaService {
    private propinas: Propina[] = [
        {
            id: 1,
            artistaId: 101,
            usuarioId: 201,
            monto: 5,
            fecha: new Date(),
            nombreFan: 'Laura',
            mensaje: '¡Gracias por tu música!',
            cantidad: 5
        },
        {
            id: 2,
            artistaId: 102,
            usuarioId: 202,
            monto: 3,
            fecha: new Date(),
            nombreFan: 'Carlos',
            mensaje: 'Sigue así 💖',
            cantidad: 3
        }
    ];

    private propinasSubject = new BehaviorSubject<Propina[]>(this.propinas);

    obtenerPropinas(): Observable<Propina[]> {
        return this.propinasSubject.asObservable();
    }

agregarPropina(p: Propina): Observable<Propina> {
    p.id = Date.now();
    p.fecha = new Date();
    this.propinas.push(p);
    this.propinasSubject.next([...this.propinas]);
    return of(p); // ⬅️ devuelve Observable para que puedas usar .subscribe()
}

}