import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembresiaService } from '@services/membresia.service';
import { Membresia } from '@models/membresia.model';

@Component({
    selector: 'app-membresia-list',
    templateUrl: './membresia-list.component.html',
    styleUrls: ['./membresia-list.component.scss'],
    standalone: true,
    imports: [CommonModule],
})
    
export class MembresiaListComponent {
    membresias: Membresia[] = [];
    private membresiaService = inject(MembresiaService);

    constructor() {
        this.obtenerMembresias();
    }
    eliminarMembresia(id: number) {
        this.membresiaService.eliminarMembresia(id);
        this.obtenerMembresias();
    }
    obtenerMembresias() {
        this.membresiaService.obtenerMembresias().subscribe((data) => {
            console.log('Membresías recibidas:', data); // <-- Agrega esto
            this.membresias = data;
        });
    }
        
}
