import type { Artista } from './Artista';

export interface PerfilArtista {
  iinfoartista: Artista;
  reproducciones?: number;
  likes?: number;
  seguidores?: number;
}
