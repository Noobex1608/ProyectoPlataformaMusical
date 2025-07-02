import React, { useState, useEffect, type FormEvent } from 'react';
import type { album as Album } from '../types/Album';

interface Props {
  onSave: (album: Album) => void;
  onCancel: () => void;
  albumToEdit?: Album;
}

const AlbumForm: React.FC<Props> = ({ onSave, onCancel, albumToEdit }) => {
  const [titulo, setTitulo] = useState('');
  const [canciones, setCanciones] = useState<string>('');
  const [coverURL, setCoverURL] = useState<string>('');
  const [releaseDate, setReleaseDate] = useState('');

  useEffect(() => {
    if (albumToEdit) {
      setTitulo(albumToEdit.titulo);
      setCanciones(Array.isArray(albumToEdit.canciones) ? albumToEdit.canciones.join(', ') : albumToEdit.canciones);
      setCoverURL(albumToEdit.coverURL);
      // Convertimos timestamp a fecha yyyy-mm-dd para input type date
      const dateStr = new Date(albumToEdit.releaseDate).toISOString().slice(0, 10);
      setReleaseDate(dateStr);
    }
  }, [albumToEdit]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setCoverURL(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!titulo) {
      alert('El título es obligatorio');
      return;
    }

    const newAlbum: Album = {
      idAlbum: albumToEdit ? albumToEdit.idAlbum : Date.now(),
      titulo,
      canciones: canciones
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0)
        .join(', '),
      coverURL,
      releaseDate: releaseDate ? new Date(releaseDate).getTime() : Date.now(),
    };

    onSave(newAlbum);
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px', marginBottom: '1rem' }}>
      <h3>{albumToEdit ? 'Editar Álbum' : 'Nuevo Álbum'}</h3>

      <div>
        <label>Título:</label>
        <input value={titulo} onChange={e => setTitulo(e.target.value)} required />
      </div>

      <div>
        <label>Canciones (separadas por coma):</label>
        <input value={canciones} onChange={e => setCanciones(e.target.value)} placeholder="Canción 1, Canción 2, ..." />
      </div>

      <div>
        <label>Fecha de lanzamiento:</label>
        <input type="date" value={releaseDate} onChange={e => setReleaseDate(e.target.value)} />
      </div>

      <div>
        <label>Portada (imagen jpg/png):</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {coverURL && <img src={coverURL} alt="Portada" style={{ width: '100px', marginTop: '0.5rem' }} />}
      </div>

      <button type="submit">{albumToEdit ? 'Guardar Cambios' : 'Agregar Álbum'}</button>
      <button type="button" onClick={onCancel} style={{ marginLeft: '1rem' }}>Cancelar</button>
    </form>
  );
};

export default AlbumForm;
