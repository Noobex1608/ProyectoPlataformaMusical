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

  if (songs.length === 0) return <p>No hay canciones.</p>;

  return (
    <div>
      <h3>Lista de Canciones</h3>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {songs.map(song => {
          try {
            return (
              <li
                key={song.id}
                style={{
                  borderBottom: '1px solid #ddd',
                  marginBottom: '0.5rem',
                  paddingBottom: '0.5rem',
                }}
              >
                <strong>{song.title}</strong> - {song.artist} ({song.genre || 'Género no definido'})
                <br />
                Álbum: {song.album || 'N/A'} | Duración: {song.duration}s
                <br />
                Lanzamiento:{' '}
                {song.releaseDate
                  ? new Date(song.releaseDate).toISOString().slice(0, 10)
                  : 'N/A'}
                <br />
                {song.imagenUrl && (
                  <img
                    src={song.imagenUrl}
                    alt={song.title}
                    style={{ width: '100px', marginTop: '0.5rem' }}
                  />
                )}
                <br />
                {song.audioData && (
                  <audio controls style={{ display: 'block', marginTop: '0.5rem' }}>
                    <source src={song.audioData} />
                    Tu navegador no soporta audio.
                  </audio>
                )}
                <button onClick={() => onEdit(song)}>Editar</button>
                <button
                  onClick={() => onDelete(song.id)}
                  style={{ marginLeft: '0.5rem', color: 'red' }}
                >
                  Eliminar
                </button>
              </li>
            );
          } catch (err) {
            console.error('❌ Error al renderizar una canción:', song, err);
            return null;
          }
        })}
      </ul>
    </div>
  );
};

export default SongList;
