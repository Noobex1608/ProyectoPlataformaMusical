import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-ver-recompensas',
    imports: [CommonModule],
    template: `
    <h2 class="text-xl font-bold mb-4">Recompensas Disponibles</h2>
    <ul class="space-y-3">
      <li *ngFor="let recompensa of recompensas" class="p-3 bg-green-700 rounded text-white">
        🎁 {{ recompensa.nombre }} - {{ recompensa.puntos }} pts
      </li>
    </ul>
  `
})
export class VerRecompensasComponent {
    recompensas = [
        { nombre: 'Sticker exclusivo', puntos: 100 },
        { nombre: 'Entrada concierto', puntos: 500 }
    ];
}
