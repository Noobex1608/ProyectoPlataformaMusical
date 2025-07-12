import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Recompensa } from '../models/recompensa.model';

@Injectable({
    providedIn: 'root',
})
export class RecompensaService {
    private recompensas: Recompensa[] = [
        { id: '1', nombre: 'Sticker Pack', descripcion: 'Paquete de stickers exclusivos', costoPuntos: 100 },
        { id: '2', nombre: 'Mención en redes', descripcion: 'Te mencionamos en nuestras redes sociales', costoPuntos: 200 },
        { id: '3', nombre: 'Camiseta Oficial', descripcion: 'Camiseta edición limitada', costoPuntos: 500 },
    ];

    private recompensas$ = new BehaviorSubject<Recompensa[]>(this.recompensas);

    getRecompensas(): Observable<Recompensa[]> {
        return this.recompensas$.asObservable();
    }

    agregarRecompensa(recompensa: Recompensa): void {
        recompensa.id = Math.random().toString(36).substring(2, 9);
        this.recompensas.push(recompensa);
        this.recompensas$.next(this.recompensas);
    }

    canjear(recompensa: Recompensa): void {
        alert(`¡Has canjeado: ${recompensa.nombre}!`);
    }
}
