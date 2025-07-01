import React from 'react';
import type { album as Album } from '../types/Album';

interface Props {
  albums: Album[];
  onEdit: (album: Album) => void;
  onDelete: (idalbum: number) => void;
}

const AlbumList: React.FC<Props> = ({ albums, onEdit, onDelete }) => {
  if (albums.length === 0) return <p>No hay álbumes.</p>;

  return (
    <div>
      <h3>Lista de Álbumes</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {albums.map(album => (
          <li key={album.idAlbum} style={{ borderBottom: '1px solid #ddd', marginBottom: '0.5rem', paddingBottom: '0.5rem' }}>
            <strong>{album.titulo}</strong><br />
            Fecha lanzamiento: {new Date(album.releaseDate).toISOString().slice(0, 10)}<br />
            Canciones:{album.canciones && album.canciones.length > 0 ? album.canciones : 'Ninguna'}<br />
            {album.coverURL && <img src={album.coverURL} alt={album.titulo} style={{ width: '100px', marginTop: '0.5rem' }} />}<br />
            <button onClick={() => onEdit(album)}>Editar</button>
            <button onClick={() => onDelete(album.idAlbum)} style={{ marginLeft: '0.5rem', color: 'red' }}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AlbumList;
