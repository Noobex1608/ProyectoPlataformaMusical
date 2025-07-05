import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembresiaService } from '@services/membresia.service';
import { PropinaService } from '@services/propina.service';
import { Membresia } from '@models/membresia.model';
import { Propina } from '@models/propina.model';

@Component({
    selector: 'app-membresia-list',
    templateUrl: './membresia-list.component.html',
    styleUrls: ['./membresia-list.component.scss'],
    standalone: true,
    imports: [CommonModule],
})
export class MembresiaListComponent {
    membresias: Membresia[] = [];
    propinas: Propina[] = [];

    private membresiaService = inject(MembresiaService);
    private propinaService = inject(PropinaService);

    constructor() {
        this.obtenerMembresias();
        this.obtenerPropinas();
    }

    obtenerMembresias(): void {
        this.membresiaService.obtenerMembresias().subscribe((data: Membresia[]) => {
            this.membresias = data;
        });
    }

    obtenerPropinas(): void {
        this.propinaService.obtenerPropinas().subscribe((data: Propina[]) => {
            this.propinas = data;
        });
    }

    eliminarMembresia(id: number): void {
        this.membresiaService.eliminarMembresia(id);
        this.obtenerMembresias(); // recarga la lista actualizada
    }
}
