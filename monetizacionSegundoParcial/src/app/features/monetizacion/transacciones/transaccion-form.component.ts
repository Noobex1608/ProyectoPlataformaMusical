import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransaccionService } from '../../../services/transaccion.service';
import { Transaccion } from '../../../models/transaccion.model';

@Component({
    selector: 'app-transaccion-form',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './transaccion-form.component.html',
    styleUrls: ['./transaccion-form.component.scss']
})
export class TransaccionFormComponent {
    form: FormGroup;
    transaccion: Partial<Transaccion> = {
        descripcion: '',
        monto: 0
    };
    tipoSeleccionado: string = '';

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

    guardar(): void {
        console.log('Guardando transacción:', this.transaccion);
        // Lógica para guardar transacción
    }

    setTipo(): void {
        console.log('Tipo seleccionado:', this.tipoSeleccionado);
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
