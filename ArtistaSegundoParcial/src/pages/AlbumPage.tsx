import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { album as Album } from '../types/Album';
import AlbumForm from '../components/AlbumForm';
import AlbumList from '../components/AlbumList';

const LOCAL_STORAGE_KEY = 'mis_albumes';

const AlbumPage: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Cargar álbumes desde localStorage al montar y cuando se regrese al foco
  useEffect(() => {
    const cargarDesdeStorage = () => {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setAlbums(JSON.parse(saved));
      }
    };

    cargarDesdeStorage(); // Inicial

    // Volver a cargar si se vuelve a enfocar la ventana
    window.addEventListener('focus', cargarDesdeStorage);

    return () => {
      window.removeEventListener('focus', cargarDesdeStorage);
    };
  }, []);

  // Guardar en localStorage cada vez que cambia el estado
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(albums));
  }, [albums]);

  const handleSave = (album: Album) => {
    if (editingAlbum) {
      setAlbums(albums.map(a => (a.idAlbum === album.idAlbum ? album : a)));
    } else {
      setAlbums([...albums, album]);
    }
    setShowForm(false);
    setEditingAlbum(null);
  };

  const handleEdit = (album: Album) => {
    setEditingAlbum(album);
    setShowForm(true);
  };

  const handleDelete = (idalbum: number) => {
    if (window.confirm('¿Eliminar este álbum?')) {
      setAlbums(albums.filter(a => a.idAlbum !== idalbum));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAlbum(null);
  };

  return (
    <section className="dashboard">
      <Link
        to="/"
        className="btn btn-secondary"
        style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          textDecoration: 'none',
        }}
      >
        ← Volver al Dashboard
      </Link>

      <h2 style={{ color: '#348e91', marginBottom: '2rem' }}>
        💿 Gestión de Álbumes
      </h2>

      <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {!showForm && (
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              ➕ Crear Nuevo Álbum
            </button>
          </div>
        )}

        {showForm && (
          <AlbumForm
            onSave={handleSave}
            onCancel={handleCancel}
            albumToEdit={editingAlbum || undefined}
          />
        )}

        <AlbumList albums={albums} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    </section>
  );
};

export default AlbumPage;
