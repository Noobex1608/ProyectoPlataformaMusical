import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Punto } from '../../../models/sistema-de-puntos.model';
import { PuntosService } from '../../../services/punto.service';

@Component({
    selector: 'app-punto-list',
    standalone: true, 
    imports: [CommonModule],
    templateUrl: './punto-list.component.html',
    styleUrls: ['./punto-list.component.scss'],
    providers: [PuntosService]
})
export class PuntoListComponent {
    puntos: Punto[] = [];

    constructor(private puntosService: PuntosService) {
        this.puntosService.obtenerTodos().subscribe((puntos: Punto[]) => {
            this.puntos = puntos;
        });
    }
}
