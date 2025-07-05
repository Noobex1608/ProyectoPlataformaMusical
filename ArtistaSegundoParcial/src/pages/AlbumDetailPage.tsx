import React from 'react';
import { useParams, Link } from 'react-router-dom';
import type { album as Album } from '../types/Album';

const LOCAL_STORAGE_KEY = 'mis_albumes';

const AlbumDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = React.useState<Album | null>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const albums: Album[] = JSON.parse(saved);
      const found = albums.find(a => a.idAlbum === Number(id));
      setAlbum(found || null);
    }
  }, [id]);

  if (!album) {
    return (
      <div style={{ color: '#fff', padding: '2rem' }}>
        <p>Álbum no encontrado.</p>
        <Link to="/albumes" style={{ color: '#1f9ea8' }}>&larr; Volver a álbumes</Link>
      </div>
    );
  }

  return (
    <div style={{ color: '#fff', padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
      <Link to="/albumes" style={{ color: '#1f9ea8', marginBottom: '1rem', display: 'inline-block' }}>&larr; Volver a álbumes</Link>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}>
        {album.coverURL && (
          <img src={album.coverURL} alt={album.titulo} style={{ width: 180, height: 180, objectFit: 'cover', borderRadius: 12 }} />
        )}
        <div>
          <h2 style={{ margin: 0, fontSize: '3rem', color: '#111', fontWeight: 800, letterSpacing: '-2px' }}>{album.titulo}</h2>
          <p style={{ color: '#b3b3b3', fontSize: '1.1rem', margin: 0 }}>{new Date(album.releaseDate).getFullYear()}</p>
        </div>
      </div>
      <h3>Canciones</h3>
      <ul style={{ color: '#222', fontSize: '1.1rem', paddingLeft: 0, background: '#fff', borderRadius: 8, padding: '1rem', marginTop: 0 }}>
        {album.canciones && album.canciones.length > 0 ? (
          album.canciones.map((c, i) => (
            <li key={i} style={{ color: '#222', marginBottom: 16, listStyle: 'none', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #eee', paddingBottom: 12 }}>
              {/* Imagen de la canción */}
              <input type="file" accept="image/*" style={{ display: 'none' }} id={`song-img-${i}`} onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () => {
                  const albums = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
                  const idx = albums.findIndex((a: any) => a.idAlbum === album.idAlbum);
                  if (idx !== -1) {
                    if (!albums[idx].songImages) albums[idx].songImages = [];
                    albums[idx].songImages[i] = reader.result;
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(albums));
                    setAlbum({ ...album, songImages: albums[idx].songImages });
                  }
                };
                reader.readAsDataURL(file);
              }} />
              <label htmlFor={`song-img-${i}`} style={{ cursor: 'pointer' }}>
                <img src={album.songImages && album.songImages[i] ? album.songImages[i] : 'https://via.placeholder.com/60x60?text=+'} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, background: '#eee' }} />
              </label>
              {/* Título de la canción */}
              <span style={{ fontWeight: 600, fontSize: '1.1rem', flex: 1 }}>{c}</span>
              {/* Colaborador/cantante */}
              <input
                type="text"
                placeholder="Colaborador/Cantante"
                style={{ border: '1px solid #ccc', borderRadius: 4, padding: '0.2rem 0.5rem', fontSize: '1rem', minWidth: 120 }}
                value={album.songCollaborators && album.songCollaborators[i] ? album.songCollaborators[i] : ''}
                onChange={e => {
                  const albums = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
                  const idx = albums.findIndex((a: any) => a.idAlbum === album.idAlbum);
                  if (idx !== -1) {
                    if (!albums[idx].songCollaborators) albums[idx].songCollaborators = [];
                    albums[idx].songCollaborators[i] = e.target.value;
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(albums));
                    setAlbum({ ...album, songCollaborators: albums[idx].songCollaborators });
                  }
                }}
              />
            </li>
          ))
        ) : (
          <li style={{ color: '#222' }}>No hay canciones registradas.</li>
        )}
      </ul>
    </div>
  );
};

export default AlbumDetailPage;
