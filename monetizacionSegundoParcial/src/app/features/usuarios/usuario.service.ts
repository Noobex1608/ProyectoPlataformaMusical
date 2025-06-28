import { Injectable } from '@angular/core';
import { Artista } from './artista.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
    private artistas: Artista[] = [
        { id: 1, nombre: 'Rosalía' },
        { id: 2, nombre: 'Bad Bunny' },
        { id: 3, nombre: 'Duki' }
    ];

    obtenerArtistas(): Artista[] {
        return [...this.artistas];
    }

    agregarArtista(artista: Artista) {
        this.artistas.push(artista);
    }

    eliminarArtista(id: number) {
        this.artistas = this.artistas.filter(a => a.id !== id);
    }
}
