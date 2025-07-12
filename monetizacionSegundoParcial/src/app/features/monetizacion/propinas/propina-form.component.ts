import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PropinaService } from '../../../services/propina.service';
import { Propina } from '../../../models/propina.model';

@Component({
    selector: 'app-propina-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './propina-form.component.html',
    styleUrls: ['./propina-form.component.scss']
})
export class PropinaFormComponent {
    nuevaPropina: Propina = {
        id: 0,
        usuarioId: 201, // simulando usuario logueado
        monto: 0,
        mensaje: ''
    };

    constructor(
        private propinaService: PropinaService,
        private router: Router
    ) { }

    enviarPropina() {
        if (this.nuevaPropina.monto > 0 && this.nuevaPropina.mensaje.trim()) {
            this.propinaService.enviarPropina(this.nuevaPropina).subscribe(() => {
                this.router.navigate(['/propinas']);
            });
        }
    }
}
