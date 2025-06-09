// src/types/audio.types.ts
export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  duration: number;
  url: string;
  coverUrl?: string;
  metadata?: {
    bpm?: number;
    key?: string;
    genre?: string[];
    explicit?: boolean;
  };
}

export interface RadioStation {
  id: string;
  name: string;
  description?: string;
  seeds: Array<{
    type: 'artist' | 'genre' | 'track';
    id: string;
  }>;
  lastPlayed?: string;
}

export type RadioAction = 'play' | 'skip' | 'like' | 'share';