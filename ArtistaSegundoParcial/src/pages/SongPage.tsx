import React, { useState, useEffect, useRef } from 'react';
import type { song as Song } from '../types/cancion';
import SongForm from '../components/SongForm';
import SongList from '../components/SongList';

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
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '1rem' }}>
      <h2>Gestión de Canciones</h2>
      {!showForm && <button onClick={() => setShowForm(true)}>Agregar Canción</button>}
      {showForm && (
        <SongForm onSave={handleSave} onCancel={handleCancel} songToEdit={editingSong || undefined} />
      )}
      {songs.length === 0 ? (
        <p>No hay canciones registradas.</p>
      ) : (
        <SongList songs={songs} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default SongPage;
