import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PropinaService } from '../../../services/propina.service';
import { RecompensaService } from '../../../services/recompensa.service';
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
        private recompensaService: RecompensaService,
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

            // Enviar propina (sin subscribe)
            this.propinaService.enviarPropina({
                artista_id: 'artista-001', // Puedes reemplazarlo según tu lógica
                fan_id: datos.usuarioId,
                monto: datos.monto,
                nombre_fan: datos.remitente,
                mensaje: datos.mensaje,
                cantidad: datos.monto,
                metodo_pago: 'tarjeta',
                publico_en_feed: true
            });

            // Agregar puntos (sin subscribe)
            // TODO: Adaptar para recompensas service
            // this.recompensaService.agregarPuntos(datos.usuarioId, datos.monto * 10);

            // Redirigir
            this.router.navigate(['/propinas']);
        }
    }
}
