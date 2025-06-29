import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // para ngModel
import { UsuarioService } from '../usuario.service';
import { Artista } from '../artista.model';

@Component({
    standalone: true,
    selector: 'app-explorar-artistas',
    imports: [CommonModule, FormsModule],
    template: `
    <h2 class="text-xl font-bold mb-4">Explorar Artistas</h2>

    <form (ngSubmit)="agregarArtista()" class="mb-4">
      <input [(ngModel)]="nuevoNombre" name="nombre" placeholder="Nombre del artista" class="p-2 rounded bg-gray-100 mr-2">
      <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded">Agregar</button>
    </form>

    <ul class="grid grid-cols-2 gap-4">
      <li *ngFor="let artista of artistas" class="p-4 rounded bg-gray-800 text-white flex justify-between items-center">
        🎤 {{ artista.nombre }}
        <button (click)="eliminarArtista(artista.id)" class="text-red-400 hover:text-red-600">✖</button>
      </li>
    </ul>
  `
})
export class ExplorarArtistasComponent {
    private usuarioService: UsuarioService = inject(UsuarioService); // ✅ tipo explícito
    artistas: Artista[] = [];
    nuevoNombre: string = '';

    constructor() {
        this.recargarLista();
    }

    recargarLista() {
        this.artistas = this.usuarioService.obtenerArtistas();
    }

    agregarArtista() {
        if (!this.nuevoNombre.trim()) return;
        const nuevo: Artista = {
            id: Date.now(),
            nombre: this.nuevoNombre.trim()
        };
        this.usuarioService.agregarArtista(nuevo);
        this.nuevoNombre = '';
        this.recargarLista();
    }

    eliminarArtista(id: number) {
        this.usuarioService.eliminarArtista(id);
        this.recargarLista();
    }
}
