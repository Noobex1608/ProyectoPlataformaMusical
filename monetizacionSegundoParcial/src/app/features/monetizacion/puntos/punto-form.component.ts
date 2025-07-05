import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PropinaService } from '../../../services/propina.service';
import { PuntosService } from '../../../services/punto.service';
@Component({
    selector: 'app-propina-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './punto-form.component.html',
    styleUrls: ['./punto-form.component.scss'],
    providers: [PropinaService]
})
export class PropinaFormComponent {
    form: FormGroup;

    constructor(
        private fb: FormBuilder,
        private propinaService: PropinaService,
        private puntosService: PuntosService,
        private router: Router
    ) {
        this.form = this.fb.group({
            remitente: ['', Validators.required],
            monto: [0, [Validators.required, Validators.min(1)]],
            mensaje: [''],
            usuarioId: ['', Validators.required]
        });
    }

    enviar(): void {
        if (this.form.valid) {
            const datos = this.form.value;

            // Agregar propina (sin subscribe)
            this.propinaService.agregarPropina({
                id: Date.now(),
                artistaId: 1, // Puedes reemplazarlo según tu lógica
                usuarioId: datos.usuarioId,
                monto: datos.monto,
                fecha: new Date(),
                nombreFan: datos.remitente,
                mensaje: datos.mensaje,
                cantidad: datos.monto
            });

            // Agregar puntos (sin subscribe)
            this.puntosService.agregarPuntos(datos.usuarioId, datos.monto * 10);

            // Redirigir
            this.router.navigate(['/propinas']);
        }
    }
}
