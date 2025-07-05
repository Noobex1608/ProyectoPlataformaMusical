export interface album {
    idAlbum: number;
    canciones: string[];
    coverURL: string;
    titulo: string;
    releaseDate: number;
    songImages?: string[];
    songCollaborators?: string[];
}