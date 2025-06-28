import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecompensaService } from '../../../services/recompensa.service';
import { Recompensa } from '../../../models/recompensa.model';

@Component({
    selector: 'app-recompensa-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './recompensa-list.component.html',
    styleUrls: ['./recompensa-list.component.scss']
})
export class RecompensaListComponent implements OnInit {
    recompensas: Recompensa[] = [];

    constructor(private recompensaService: RecompensaService) { }

    ngOnInit(): void {
        this.recompensaService.obtenerRecompensas().subscribe((recompensas) => {
            this.recompensas = recompensas;
        });
    }

    eliminar(id: number): void {
        this.recompensaService.eliminarRecompensa(id);
        this.recompensaService.obtenerRecompensas().subscribe((recompensas) => {
            this.recompensas = recompensas;
        });
    }
}
