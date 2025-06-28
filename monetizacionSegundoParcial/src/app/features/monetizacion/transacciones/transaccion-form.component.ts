import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransaccionService } from '../../../services/transaccion.service';
import { Router } from '@angular/router';

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
            tipo: ['membresia', Validators.required],
            descripcion: ['', Validators.required],
            monto: [0, [Validators.required, Validators.min(1)]]
        });
    }

    registrar(): void {
        if (this.form.valid) {
            this.transaccionService.agregarTransaccion(this.form.value);
            this.router.navigate(['/transacciones']);
        }
    }
}
