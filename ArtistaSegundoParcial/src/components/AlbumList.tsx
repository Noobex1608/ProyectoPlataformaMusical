import React from 'react';
import type { album as Album } from '../types/Album';

interface Props {
  albums: Album[];
  onEdit: (album: Album) => void;
  onDelete: (idalbum: number) => void;
}

const AlbumList: React.FC<Props> = ({ albums, onEdit, onDelete }) => {
  if (albums.length === 0) {
    return (
      <div className="empty-state">
        <h3>No hay álbumes todavía</h3>
        <p>Comienza creando tu primer álbum</p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ color: '#348e91', textAlign: 'center', marginBottom: '2rem' }}>
        Mis Álbumes ({albums.length})
      </h3>
      <div className="album-list">
        {albums.map(album => (
          <div key={album.idAlbum} className="album-card">
            {album.coverURL && (
              <img 
                src={album.coverURL} 
                alt={album.titulo} 
                className="album-cover"
              />
            )}
            <h3>{album.titulo}</h3>
            <p><strong>Fecha de lanzamiento:</strong> {new Date(album.releaseDate).toLocaleDateString()}</p>
            <p><strong>Canciones:</strong> {album.canciones && album.canciones.length > 0 ? album.canciones : 'Ninguna'}</p>
            
            <div className="album-actions">
              <button onClick={() => onEdit(album)} className="btn btn-primary">
                ✏️ Editar
              </button>
              <button onClick={() => onDelete(album.idAlbum)} className="btn btn-danger">
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlbumList;
