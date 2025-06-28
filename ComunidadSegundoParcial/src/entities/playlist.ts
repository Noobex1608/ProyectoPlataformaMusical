import type { song } from './cancion';
export interface playlist {
    id: number;
    name: string;
    description: string;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
    songs: song[];
}