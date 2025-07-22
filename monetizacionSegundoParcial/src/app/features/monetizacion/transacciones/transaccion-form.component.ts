import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransaccionService } from '@services/transaccion.service';

@Component({
    selector: 'app-transaccion-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './transaccion-form.component.html',
    styleUrls: ['./transaccion-form.component.scss']
})
export class TransaccionFormComponent {
    form: FormGroup;

    constructor(
        private fb: FormBuilder,
        private transaccionService: TransaccionService,
        private router: Router
    ) {
        this.form = this.fb.group({
            tipo: ['entrada', Validators.required],
            descripcion: ['', Validators.required],
            monto: [0, [Validators.required, Validators.min(0.1)]],
            usuarioId: ['', Validators.required]
        });
    }

    enviar(): void {
        if (this.form.valid) {
            const transaccion = {
                ...this.form.value,
                fecha: new Date().toISOString()
            };

            this.transaccionService.crearTransaccion(transaccion);
            this.router.navigate(['/transacciones']);
        }
    }
}
