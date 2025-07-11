import type { song } from "../../../ArtistaSegundoParcial/src/types/cancion";

export interface radio{
    id: number;
    name: string;
    description: string;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
    songs: song[];
    isPublic?: boolean;
}

