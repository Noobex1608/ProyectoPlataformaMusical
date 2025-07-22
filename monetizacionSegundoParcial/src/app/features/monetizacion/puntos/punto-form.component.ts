import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-punto-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './punto-form.component.html',
    styleUrls: ['./punto-form.component.scss']
})
export class PuntoFormComponent {
    punto: any = {
        tipo: '',
        cantidad: 0
    };

    constructor(private router: Router) {}

    guardar(): void {
        console.log('Guardando punto:', this.punto);
        // Lógica para guardar punto
    }
}
