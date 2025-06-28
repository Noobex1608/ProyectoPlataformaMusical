import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PuntosService } from '../../../services/punto.service';
import { Punto } from '../../../models/sistema-de-puntos.model';

@Component({
    selector: 'app-punto-form',
    standalone: true,
    templateUrl: './punto-form.component.html',
    styleUrls: ['./punto-form.component.scss'],
    imports: [CommonModule, ReactiveFormsModule],
    providers: [PuntosService],
})
export class PuntoFormComponent {
    form: FormGroup;

    constructor(private fb: FormBuilder, private puntoService: PuntosService) {
        this.form = this.fb.group({
            usuarioId: ['', Validators.required],
            cantidad: [0, [Validators.required, Validators.min(1)]],
            motivo: ['']
        });
    }

    enviar() {
        if (this.form.valid) {
            const nuevoPunto: Punto = {
                ...this.form.value,
                fecha: new Date()
            };

            this.puntoService.agregarPuntos(nuevoPunto); // ✅ objeto completo
            this.form.reset();
        }
        } 
    }
        
