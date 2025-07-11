import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAlbumes, type Album } from '../hooks/useAlbumes';
import AlbumForm from '../components/AlbumForm';
import AlbumList from '../components/AlbumList';

const AlbumPage: React.FC = () => {
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const { albums, loading, error, eliminarAlbum } = useAlbumes();

  const handleSave = () => {
    setShowForm(false);
    setEditingAlbum(null);
  };

  const handleEdit = (album: Album) => {
    setEditingAlbum(album);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este álbum?')) {
      try {
        await eliminarAlbum(id);
      } catch (error) {
        console.error('Error eliminando álbum:', error);
        alert('Error eliminando álbum');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAlbum(null);
  };

  if (loading) {
    return (
      <section className="dashboard">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>🔄 Cargando álbumes...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="dashboard">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'red' }}>❌ Error: {error}</p>
        </div>
      </section>
    );
  }

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
