import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
    standalone: true,
    selector: 'app-enviar-propina',
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <h2 class="text-xl font-bold mb-4">Enviar Propina</h2>
    <form [formGroup]="form" (ngSubmit)="enviar()" class="space-y-4">
      <input formControlName="artista" placeholder="Artista" class="p-2 w-full rounded" />
      <input formControlName="monto" placeholder="Monto" type="number" class="p-2 w-full rounded" />
      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Enviar</button>
    </form>
  `
})
export class EnviarPropinaComponent {
    form: FormGroup;

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({ artista: [''], monto: [''] });
    }

    enviar() {
        console.log('Propina enviada:', this.form.value);
    }
}