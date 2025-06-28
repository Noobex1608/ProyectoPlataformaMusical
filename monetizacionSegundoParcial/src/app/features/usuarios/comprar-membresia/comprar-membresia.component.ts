import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-comprar-membresia',
    imports: [CommonModule],
    template: `
    <h2 class="text-xl font-bold mb-4">Membresías</h2>
    <ul class="space-y-3">
      <li *ngFor="let m of membresias" class="p-3 bg-purple-700 rounded text-white">
        💎 {{ m.tipo }} - {{ m.precio }} USD
      </li>
    </ul>
  `
})
export class ComprarMembresiaComponent {
    membresias = [
        { tipo: 'Básica', precio: 5 },
        { tipo: 'Premium', precio: 10 }
    ];
}