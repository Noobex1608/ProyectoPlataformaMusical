// src/app/features/monetizacion/puntos/punto-form.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PuntoService } from '../../../services/punto.service';
import { Punto } from '../../../models/sistemapuntos.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-punto-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './punto-form.component.html',
    styleUrls: ['./punto-form.component.scss']
})
export class PuntoFormComponent {
    punto: Punto = {
        id: 0,
        usuarioId: 1, // Usuario fijo por ahora
        tipo: 'manual',
        cantidad: 0,
        fecha: new Date().toISOString()
    };

    constructor(private puntoService: PuntoService, private router: Router) { }

    guardar() {
        this.puntoService.agregarPunto(this.punto).subscribe(() => {
            alert('Punto agregado correctamente');
            this.router.navigate(['/puntos']);
        });
    }
}
