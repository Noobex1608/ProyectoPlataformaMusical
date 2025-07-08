import React, { useState } from 'react';
import type { song as Song } from '../types/cancion';
import SongForm from '../components/SongForm';
import SongList from '../components/SongList';
import { Link } from 'react-router-dom';
import { useCanciones } from '../hooks/useCanciones';

const SongPage: React.FC = () => {
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Hook para gestión de canciones con Supabase
  const {
    canciones: songs,
    loading,
    error,
    crearCancion,
    actualizarCancion,
    eliminarCancion
  } = useCanciones();

  const handleSave = async (song: Song) => {
    try {
      if (editingSong) {
        await actualizarCancion(editingSong.id, song);
      } else {
        await crearCancion(song);
      }
      setShowForm(false);
      setEditingSong(null);
    } catch (err) {
      console.error('Error guardando canción:', err);
      // El error ya se maneja en el hook
    }
    setShowForm(false);
    setEditingSong(null);
  };

  const handleEdit = (song: Song) => {
    setEditingSong(song);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Eliminar esta canción?')) {
      try {
        await eliminarCancion(id);
      } catch (err) {
        console.error('Error eliminando canción:', err);
        // El error ya se maneja en el hook
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSong(null);
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
        🎶 Gestión de Canciones
      </h2>

      {/* Mostrar estado de carga y errores */}
      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          margin: '1rem 0'
        }}>
          🔄 Cargando canciones...
        </div>
      )}

      {error && (
        <div style={{ 
          textAlign: 'center', 
          padding: '1rem',
          background: '#ffe6e6',
          borderRadius: '8px',
          margin: '1rem 0',
          color: '#d32f2f',
          border: '1px solid #ffcdd2'
        }}>
          ❌ Error: {error}
        </div>
      )}
      
      <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Mostrar resumen de canciones */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '1.5rem', 
          borderRadius: '12px', 
          border: '1px solid #e1e5e9',
          textAlign: 'center'
        }}>
          <strong style={{ color: '#348e91', fontSize: '1.2rem' }}>
            📊 Total de canciones: {songs.length}
          </strong>
          {songs.length > 0 && (
            <div style={{ 
              marginTop: '1rem', 
              color: '#666', 
              fontSize: '0.9rem',
              maxHeight: '100px',
              overflowY: 'auto'
            }}>
              {songs.map((s, i) => (
                <span key={s.id || i}>
                  {i + 1}. {s.title} {i < songs.length - 1 && ' • '}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {!showForm && (
          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={() => setShowForm(true)} 
              className="btn btn-primary"
              disabled={loading}
            >
              ➕ Crear Nueva Canción
            </button>
          </div>
        )}
        
        {showForm && (
          <SongForm 
            onSave={handleSave} 
            onCancel={handleCancel} 
            songToEdit={editingSong || undefined}
            disabled={loading}
          />
        )}
        
        {songs.length === 0 && !showForm && !loading ? (
          <div className="empty-state">
            <h3>¡Hora de crear tu primera canción!</h3>
            <p>Sube tu música y compártela con el mundo</p>
          </div>
        ) : (
          !loading && <SongList songs={songs} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>
    </section>
  );
};

export default SongPage;
