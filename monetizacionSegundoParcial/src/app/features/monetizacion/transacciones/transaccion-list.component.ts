import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransaccionService } from '@services/transaccion.service';
import { Transaccion } from '@models/transaccion.model';

@Component({
    selector: 'app-transaccion-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './transaccion-list.component.html',
    styleUrls: ['./transaccion-list.component.scss']
})
export class TransaccionListComponent {
    transacciones: Transaccion[] = [];

    constructor(private transaccionService: TransaccionService) {
        this.transaccionService.obtenerTransacciones().subscribe(data => {
            this.transacciones = data;
        });
    }
}
