import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-mis-transacciones',
    imports: [CommonModule],
    template: `
    <h2 class="text-xl font-bold mb-4">Mis Transacciones</h2>
    <ul class="space-y-2">
      <li *ngFor="let t of transacciones" class="p-3 bg-gray-700 text-white rounded">
        {{ t.descripcion }} - {{ t.monto }} USD
      </li>
    </ul>
  `
})
export class MisTransaccionesComponent {
    transacciones = [
        { descripcion: 'Membresía Premium', monto: 10 },
        { descripcion: 'Propina a Artista A', monto: 3 }
    ];
}
