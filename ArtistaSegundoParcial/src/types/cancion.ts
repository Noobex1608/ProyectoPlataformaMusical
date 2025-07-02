export interface song{
    id: number;
    title: string;
    artist: string;
    album: string;
    duration: number; 
    genre: string;
    releaseDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    playlistId?: number; 
    imagenUrl?: string; // URL de la imagen de la canción
    audioData?: string; // Datos de audio en base64
    lyrics?: string; // Letra de la canción
}