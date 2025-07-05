import React from 'react';
import { Link } from 'react-router-dom';
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
      <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '2rem', marginBottom: '2rem' }}>Albums</h2>
      <div className="album-list" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {albums.map(album => (
          <Link
            key={album.idAlbum}
            to={`/albumes/${album.idAlbum}`}
            style={{ textDecoration: 'none' }}
          >
            <div className="album-card" style={{ display: 'flex', alignItems: 'center', background: '#181818', borderRadius: '12px', padding: '1rem', gap: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', cursor: 'pointer', transition: 'background 0.2s' }}>
              {album.coverURL && (
                <img 
                  src={album.coverURL} 
                  alt={album.titulo} 
                  style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }}
                />
              )}
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.3rem', margin: 0 }}>{album.titulo}</h3>
                <p style={{ color: '#b3b3b3', fontSize: '1.1rem', margin: 0 }}>{new Date(album.releaseDate).getFullYear()}</p>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                <button onClick={e => { e.preventDefault(); onEdit(album); }} className="btn btn-primary">
                  ✏️ Editar
                </button>
                <button onClick={e => { e.preventDefault(); onDelete(album.idAlbum); }} className="btn btn-danger">
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AlbumList;
