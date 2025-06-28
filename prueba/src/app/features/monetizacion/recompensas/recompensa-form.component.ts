import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RecompensaService } from '../../../services/recompensa.service';
import { Router } from '@angular/router';

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
            titulo: ['', Validators.required],
            descripcion: ['', Validators.required],
            puntos: [0, [Validators.required, Validators.min(1)]]
        });
    }

    crear(): void {
        if (this.form.valid) {
            this.recompensaService.agregarRecompensa(this.form.value);
            this.router.navigate(['/recompensas']);
        }
    }
}
