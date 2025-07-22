import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PropinaService } from '../../../services/propina.service';
import { Propina } from '../../../models/propina.model';

@Component({
    selector: 'app-propina-form',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './propina-form.component.html',
    styleUrls: ['./propina-form.component.scss']
})
export class PropinaFormComponent {
    form: FormGroup;
    nuevaPropina: Partial<Propina> = {
        monto: 0,
        mensaje: ''
    };

    constructor(
        private fb: FormBuilder,
        private propinaService: PropinaService,
        private router: Router
    ) {
        this.form = this.fb.group({
            remitente: ['', Validators.required],
            monto: [0, [Validators.required, Validators.min(1)]],
            mensaje: ['']
        });
    }

    enviarPropina(): void {
        console.log('Enviando propina:', this.nuevaPropina);
        // Lógica para enviar propina
    }

    enviar(): void {
        if (this.form.valid) {
            this.propinaService.enviarPropina(this.form.value).subscribe(() => {
                this.router.navigate(['/propinas']);
            });
        }
    }
}