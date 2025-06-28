import { MembresiaService } from '../../services/membresia.service';
import { PropinaService } from '../../services/propina.service';
import { Membresia } from '../../models/membresia.model';
import { Propina } from '../../models/propina.model';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
    selector: 'app-monetizacion',
    templateUrl: './monetizacion.component.html',
    styleUrls: ['./monetizacion.component.scss'],
    standalone: true,
    imports: [CommonModule] // ← Agrega esto aquí
})
    
export class MonetizacionComponent {
    membresias: Membresia[] = [];
    propinas: Propina[] = [];

    private membresiaService = inject(MembresiaService);
    private propinaService = inject(PropinaService);

    constructor() {
        this.cargarMembresias();
        this.cargarPropinas();
    }

    cargarMembresias(): void {
        this.membresiaService.obtenerMembresias().subscribe({
            next: (data: Membresia[]) => {
                this.membresias = data;
            },
            error: (err: unknown) => {
                console.error('Error al cargar membresías:', err);
            }
        });
    }

    cargarPropinas(): void {
        this.propinaService.obtenerPropinas().subscribe({
            next: (data: Propina[]) => {
                this.propinas = data;
            },
            error: (err: unknown) => {
                console.error('Error al cargar propinas:', err);
            }
        });
    }

    eliminarMembresia(id: number): void {
        this.membresiaService.eliminarMembresia(id).subscribe({
            next: () => this.cargarMembresias(),
            error: (err: unknown) => console.error('Error al eliminar membresía:', err)
        });
    }
}
