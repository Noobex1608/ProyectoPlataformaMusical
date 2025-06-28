import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransaccionService } from '../../../services/transaccion.service';
import { Transaccion } from '../../../models/transaccion.model';

@Component({
    selector: 'app-transaccion-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './transaccion-list.component.html',
    styleUrls: ['./transaccion-list.component.scss']
})
export class TransaccionListComponent implements OnInit {
    transacciones: Transaccion[] = [];

    constructor(private transaccionService: TransaccionService) { }

    ngOnInit(): void {
        this.transaccionService.obtenerTransacciones().subscribe((transacciones: Transaccion[]) => {
            this.transacciones = transacciones;
        });
    }

    eliminar(id: number): void {
        this.transaccionService.eliminarTransaccion(id);
        this.transaccionService.obtenerTransacciones().subscribe((transacciones: Transaccion[]) => {
            this.transacciones = transacciones;
        });
    }
}
