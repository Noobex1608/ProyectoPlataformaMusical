import React from 'react';
import { Link } from 'react-router-dom';
import type { Album } from '../hooks/useAlbumes';

interface Props {
  albums: Album[];
  onEdit: (album: Album) => void;
  onDelete: (id: number) => void;
}

const AlbumList: React.FC<Props> = ({ albums, onEdit, onDelete }) => {
  console.log('🎵 Álbumes recibidos en AlbumList:', albums);

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
      <h2 style={{ color: '#348E91', fontWeight: 700, fontSize: '2rem', marginBottom: '2rem' }}>Albums</h2>
      <div className="album-list" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {albums.map(album => (
          <Link
            key={album.id}
            to={`/albumes/${album.id}`}
            style={{ textDecoration: 'none' }}
          >
            <div className="album-card" style={{ display: 'flex', alignItems: 'center', background: '#181818', borderRadius: '12px', padding: '1rem', gap: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', cursor: 'pointer', transition: 'background 0.2s' }}>
              <div style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '8px', 
                overflow: 'hidden',
                flexShrink: 0,
                backgroundColor: '#333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {album.cover_url ? (
                  <img 
                    src={album.cover_url} 
                    alt={album.titulo} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      console.error('❌ Error cargando imagen del álbum:', album.cover_url);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{ color: '#666', fontSize: '2rem' }}>🎵</div>
                )}
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.3rem', margin: 0 }}>{album.titulo}</h3>
                <p style={{ color: '#b3b3b3', fontSize: '1.1rem', margin: 0 }}>
                  {album.release_date ? new Date(album.release_date).getFullYear() : 'Sin fecha'}
                </p>
                <p style={{ color: '#888', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                  {/* Contar canciones de album_canciones + canciones vinculadas */}
                  {((album.canciones?.length || 0) + (album.cancionesVinculadas?.length || 0))} canciones
                </p>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                <button onClick={e => { e.preventDefault(); onEdit(album); }} className="btn btn-primary">
                  ✏️ Editar
                </button>
                <button onClick={e => { e.preventDefault(); onDelete(album.id); }} className="btn btn-danger">
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
