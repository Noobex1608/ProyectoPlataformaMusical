import React, { useState, useEffect, useRef } from 'react';
import type { song as Song } from '../types/cancion';
import SongForm from '../components/SongForm';
import SongList from '../components/SongList';
import { Link } from 'react-router-dom';

const LOCAL_STORAGE_KEY = 'mis_canciones';

const SongPage: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Ref para evitar guardar localStorage en el primer render
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Cargar canciones una vez al montar
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsedSongs: Song[] = JSON.parse(saved).map((s: any) => ({
        ...s,
        releaseDate: s.releaseDate ? new Date(s.releaseDate) : undefined,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
      }));
      setSongs(parsedSongs);
    }
  }, []);

  useEffect(() => {
    // No guardar en localStorage la primera vez que se ejecuta este efecto
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(songs));
      console.log('Canciones guardadas en localStorage');
    } catch (error) {
      console.error('Error guardando canciones:', error);
    }
  }, [songs]);

  const handleSave = (song: Song) => {
    if (editingSong) {
      setSongs(songs.map(s => (s.id === song.id ? song : s)));
    } else {
      setSongs([...songs, song]);
    }
    setShowForm(false);
    setEditingSong(null);
  };

  const handleEdit = (song: Song) => {
    setEditingSong(song);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Eliminar esta canción?')) {
      setSongs(songs.filter(s => s.id !== id));
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
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              ➕ Crear Nueva Canción
            </button>
          </div>
        )}
        
        {showForm && (
          <SongForm onSave={handleSave} onCancel={handleCancel} songToEdit={editingSong || undefined} />
        )}
        
        {songs.length === 0 && !showForm ? (
          <div className="empty-state">
            <h3>¡Hora de crear tu primera canción!</h3>
            <p>Sube tu música y compártela con el mundo</p>
          </div>
        ) : (
          <SongList songs={songs} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>
    </section>
  );
};

export default SongPage;
