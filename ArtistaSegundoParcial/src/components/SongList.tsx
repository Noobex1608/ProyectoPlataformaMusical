import React from 'react';
import type { song as Song } from '../types/cancion';
import '../styles/SongList.css';


interface Props {
  songs: Song[];
  onEdit: (song: Song) => void;
  onDelete: (id: number) => void;
}

const SongList: React.FC<Props> = ({ songs, onEdit, onDelete }) => {
  console.log('🎶 Canciones recibidas en SongList:', songs);

  if (songs.length === 0) {
    return (
      <div className="empty-state">
        <h3>No hay canciones todavía</h3>
        <p>Comienza creando tu primera canción</p>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <h3 style={{ color: '#348e91', textAlign: 'center', marginBottom: '2rem' }}>
        Mis Canciones ({songs.length})
      </h3>

      <div className="song-list">
        {songs.map(song => {
          try {
            return (
              <div key={song.id} className="song-card">
                {song.imagenUrl && (
                  <img
                    src={song.imagenUrl}
                    alt={song.title}
                    className="song-image"
                  />
                )}
                
                <h3>{song.title}</h3>
                <p className="song-artist">por {song.artist}</p>
                
                <div className="song-details">
                  <span>📀 {song.album || 'Sin álbum'}</span>
                  <span>🎵 {song.genre || 'Sin género'}</span>
                  <span>⏱️ {formatDuration(song.duration)}</span>
                  {song.releaseDate && (
                    <span>📅 {new Date(song.releaseDate).toLocaleDateString()}</span>
                  )}
                </div>

                {song.lyrics && (
                  <div className="song-lyrics">
                    {song.lyrics}
                  </div>
                )}

                {song.audioData && (
                  <audio controls>
                    <source src={song.audioData} />
                    Tu navegador no soporta audio.
                  </audio>
                )}

                <div className="song-actions">
                  <button onClick={() => onEdit(song)} className="btn btn-primary">
                    ✏️ Editar
                  </button>
                  <button onClick={() => onDelete(song.id)} className="btn btn-danger">
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            );
          } catch (err) {
            console.error('❌ Error al renderizar una canción:', song, err);
            return null;
          }
        })}
      </div>
    </div>
  );
};

export default SongList;
