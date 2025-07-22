import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Membresia } from '../../../models/membresia.model';
import { MembresiaService } from '../../../services/membresia.service';

@Component({
    standalone: true,
    selector: 'app-membresia-form',
    imports: [CommonModule, FormsModule],
    templateUrl: './membresia-form.component.html'
})
export class MembresiaFormComponent {
    membresia: Membresia = {
        id: 0,
        nombre: '',
        descripcion: '',
        precio: 0,
        duracion_dias: 0,
        beneficios: [],
        artista_id: '',
        activa: true,
        created_at: '',
        updated_at: ''
    };

    beneficioTemporal = '';

    constructor(private membresiaService: MembresiaService, private router: Router) { }

    agregarBeneficio() {
        if (this.beneficioTemporal.trim()) {
            this.membresia.beneficios.push(this.beneficioTemporal.trim());
            this.beneficioTemporal = '';
        }
    }

    guardar() {
        this.membresiaService.agregarMembresia(this.membresia).subscribe(() => {
            this.router.navigate(['/membresias']);
        });
    }
}
