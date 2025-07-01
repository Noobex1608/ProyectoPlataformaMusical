import React, { useState, useEffect, type FormEvent } from 'react';
import type { song as Song } from '../types/cancion';

interface Props {
  onSave: (song: Song) => void;
  onCancel: () => void;
  songToEdit?: Song;
}

const SongForm: React.FC<Props> = ({ onSave, onCancel, songToEdit }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [duration, setDuration] = useState(0);
  const [genre, setGenre] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [imagenBase64, setImagenBase64] = useState<string | undefined>(undefined);
  const [audioBase64, setAudioBase64] = useState<string | undefined>(undefined);
  const [lyrics, setLyrics] = useState('');

  useEffect(() => {
    if (songToEdit) {
      setTitle(songToEdit.title);
      setArtist(songToEdit.artist);
      setAlbum(songToEdit.album);
      setDuration(songToEdit.duration);
      setGenre(songToEdit.genre);
      setReleaseDate(songToEdit.releaseDate ? songToEdit.releaseDate.toISOString().slice(0, 10) : '');
      setImagenBase64(songToEdit.imagenUrl);
      setAudioBase64(songToEdit.audioData);
      setLyrics(songToEdit.lyrics || '');
    }
  }, [songToEdit]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagenBase64(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAudioBase64(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title || !artist) {
      alert('Título y artista son obligatorios');
      return;
    }

    const now = new Date();
    const newSong: Song = {
      id: songToEdit ? songToEdit.id : Date.now(),
      title,
      artist,
      album,
      duration,
      genre,
      releaseDate: releaseDate ? new Date(releaseDate) : undefined,
      createdAt: songToEdit ? songToEdit.createdAt : now,
      updatedAt: now,
      imagenUrl: imagenBase64,
      audioData: audioBase64,
      lyrics: lyrics || undefined,
    };

    onSave(newSong);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', borderRadius: '5px' }}
    >
      <h3>{songToEdit ? 'Editar Canción' : 'Nueva Canción'}</h3>

      <div>
        <label>Título:</label>
        <input value={title} onChange={e => setTitle(e.target.value)} required />
      </div>

      <div>
        <label>Artista:</label>
        <input value={artist} onChange={e => setArtist(e.target.value)} required />
      </div>

      <div>
        <label>Álbum:</label>
        <input value={album} onChange={e => setAlbum(e.target.value)} />
      </div>

      <div>
        <label>Duración (segundos):</label>
        <input
          type="number"
          min={0}
          value={duration}
          onChange={e => setDuration(Number(e.target.value))}
        />
      </div>

      <div>
        <label>Género:</label>
        <input value={genre} onChange={e => setGenre(e.target.value)} />
      </div>

      <div>
        <label>Fecha de Lanzamiento:</label>
        <input type="date" value={releaseDate} onChange={e => setReleaseDate(e.target.value)} />
      </div>

      <div>
        <label>Imagen (jpg, png):</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {imagenBase64 && (
          <img src={imagenBase64} alt="Preview" style={{ width: '100px', marginTop: '0.5rem' }} />
        )}
      </div>

      <div>
        <label>Audio (mp3, wav):</label>
        <input type="file" accept="audio/*" onChange={handleAudioChange} />
        {audioBase64 && (
          <audio controls style={{ display: 'block', marginTop: '0.5rem' }}>
            <source src={audioBase64} />
            Tu navegador no soporta audio.
          </audio>
        )}
      </div>

      <div>
        <label>Letra:</label>
        <textarea value={lyrics} onChange={e => setLyrics(e.target.value)} />
      </div>

      <button type="submit">{songToEdit ? 'Guardar Cambios' : 'Agregar Canción'}</button>
      <button type="button" onClick={onCancel} style={{ marginLeft: '1rem' }}>
        Cancelar
      </button>
    </form>
  );
};

export default SongForm;
