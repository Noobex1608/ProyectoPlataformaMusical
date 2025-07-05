import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecompensaService } from '@services/recompensa.service';
import { Recompensa } from '@models/recompensa.model';

@Component({
    selector: 'app-recompensa-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './recompensa-list.component.html',
    styleUrls: ['./recompensa-list.component.scss']
})
export class RecompensaListComponent {
    recompensas: Recompensa[] = [];

    constructor(private recompensaService: RecompensaService) {
        this.recompensaService.obtenerRecompensas().subscribe(data => {
            this.recompensas = data;
        });
    }
}
