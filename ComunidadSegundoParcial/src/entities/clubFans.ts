import type { Usuario } from './usuario';
export interface clubFans {
    id: number;
    name: string;
    description: string;
    artistaId: number;
    createdAt: Date;
    fans: Usuario[];
}