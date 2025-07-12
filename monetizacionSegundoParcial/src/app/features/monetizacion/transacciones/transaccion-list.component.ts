import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TransaccionService } from '../../../services/transaccion.service';
import { Transaccion } from '../../../models/transaccion.model';

@Component({
    selector: 'app-transaccion-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './transaccion-list.component.html'
})
export class TransaccionListComponent implements OnInit {
    transacciones: Transaccion[] = [];

    constructor(private servicio: TransaccionService) { }

    ngOnInit(): void {
        this.servicio.obtenerTransacciones().subscribe(data => {
            this.transacciones = data;
        });
    }

    tipoDesconocido(tipo: any): string {
        if (!tipo) return 'Sin tipo';
        if ('nombre' in tipo) return tipo.nombre;
        if ('mensaje' in tipo) return 'Propina';
        return 'Tipo desconocido';
    }
}
