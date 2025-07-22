import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RecompensaService } from '@services/recompensa.service';

@Component({
    selector: 'app-recompensa-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './recompensa-form.component.html',
    styleUrls: ['./recompensa-form.component.scss']
})
export class RecompensaFormComponent {
    form: FormGroup;

    constructor(
        private fb: FormBuilder,
        private recompensaService: RecompensaService,
        private router: Router
    ) {
        this.form = this.fb.group({
            nombre: ['', Validators.required],
            descripcion: [''],
            tipo: ['propina', Validators.required],
            precio: [null]
        });
    }

    enviar(): void {
        if (this.form.valid) {
            this.recompensaService.agregarRecompensa(this.form.value).subscribe(() => {
                this.router.navigate(['/recompensas']);
            });
        }
    }
}
