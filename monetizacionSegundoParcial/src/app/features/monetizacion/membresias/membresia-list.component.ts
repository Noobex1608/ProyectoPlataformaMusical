import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembresiaService } from '../../../services/membresia.service';
import { Membresia } from '../../../models/membresia.model';

@Component({
    selector: 'app-membresia-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './membresia-list.component.html',
})
export class MembresiaListComponent implements OnInit {
    membresias: Membresia[] = [];
    membresiaActivaId: number | null = null;

    constructor(private membresiaService: MembresiaService) { }

    ngOnInit(): void {
        this.membresiaService.obtenerMembresias().subscribe(data => {
            this.membresias = data;
        });
    }

    activarMembresia(m: Membresia): void {
        this.membresiaActivaId = m.id;
    }

    esActiva(m: Membresia): boolean {
        return this.membresiaActivaId === m.id;
    }
}
