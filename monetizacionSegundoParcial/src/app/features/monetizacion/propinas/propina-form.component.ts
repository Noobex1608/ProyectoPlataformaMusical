import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PropinaService } from '../../../services/propina.service';

@Component({
    selector: 'app-propina-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './propina-form.component.html',
    styleUrls: ['./propina-form.component.scss']
})
export class PropinaFormComponent {
    form: FormGroup;

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
    enviar(): void {
        if (this.form.valid) {
            this.propinaService.agregarPropina(this.form.value).subscribe(() => {
                this.router.navigate(['/propinas']);
            });
        }
    }
}