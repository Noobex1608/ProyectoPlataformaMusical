import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Propina } from '../models/propina.model';

@Injectable({ providedIn: 'root' })
export class PropinaService {
    private propinas: Propina[] = [
        { id: 1, usuarioId: 101, monto: 10, mensaje: 'Gracias por tu música!' }
    ];

    private propinasSubject = new BehaviorSubject<Propina[]>(this.propinas);

    obtenerPropinas(): Observable<Propina[]> {
        return this.propinasSubject.asObservable();
    }

    enviarPropina(propina: Propina): Observable<any> {
        propina.id = Math.floor(Math.random() * 10000);
        this.propinas.push(propina);
        this.propinasSubject.next([...this.propinas]);
        return of(true);
    }
}
