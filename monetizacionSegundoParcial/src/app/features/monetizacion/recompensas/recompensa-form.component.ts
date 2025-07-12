import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { RecompensaService } from '../../../services/recompensa.service';
import { Recompensa } from '../../../models/recompensa.model';



@Component({
    selector: 'app-recompensa-form',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './recompensa-form.component.html',
    styleUrls: ['./recompensa-form.component.scss']
})
export class RecompensaFormComponent {
    recompensa: Recompensa = {
        nombre: '',
        descripcion: '',
        costoPuntos: 0
    };

    constructor(
        private recompensaService: RecompensaService,
        private router: Router
    ) { }

    guardar(): void {
        this.recompensaService.agregarRecompensa(this.recompensa);
        this.router.navigate(['/recompensas']);
    }
}

