import React, { useState, useEffect } from 'react';
import type { song as Song } from '../types/cancion';
import SongForm from '../components/SongForm';
import SongList from '../components/SongList';

const LOCAL_STORAGE_KEY = 'mis_canciones';

const SongPage: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed: Song[] = JSON.parse(saved).map((s: any) => ({
        ...s,
        releaseDate: s.releaseDate ? new Date(s.releaseDate) : undefined,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
      }));
      setSongs(parsed);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(songs));
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
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1rem' }}>
      <h2>Gestión de Canciones</h2>
      {!showForm && <button onClick={() => setShowForm(true)}>Agregar Canción</button>}
      {showForm && (
        <SongForm onSave={handleSave} onCancel={handleCancel} songToEdit={editingSong || undefined} />
      )}
      <SongList songs={songs} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default SongPage;
