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
  const [songImages, setSongImages] = useState<string[]>([]);
  const [songCollaborators, setSongCollaborators] = useState<string[]>([]);
  const [coverURL, setCoverURL] = useState<string>('');
  const [releaseDate, setReleaseDate] = useState('');

  useEffect(() => {
    if (albumToEdit) {
      setTitulo(albumToEdit.titulo);
      setCanciones(Array.isArray(albumToEdit.canciones) ? albumToEdit.canciones.join(', ') : albumToEdit.canciones || '');
      setCoverURL(albumToEdit.coverURL);
      // Convertimos timestamp a fecha yyyy-mm-dd para input type date
      const dateStr = new Date(albumToEdit.releaseDate).toISOString().slice(0, 10);
      setReleaseDate(dateStr);
      setSongImages(albumToEdit.songImages ? [...albumToEdit.songImages] : []);
      setSongCollaborators(albumToEdit.songCollaborators ? [...albumToEdit.songCollaborators] : []);
    }
  }, [albumToEdit]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setCoverURL(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSongImageChange = (index: number, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSongImages(prev => {
        const arr = [...prev];
        arr[index] = reader.result as string;
        return arr;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSongCollaboratorChange = (index: number, value: string) => {
    setSongCollaborators(prev => {
      const arr = [...prev];
      arr[index] = value;
      return arr;
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!titulo) {
      alert('El título es obligatorio');
      return;
    }

    const cancionesArr = canciones
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const newAlbum: Album = {
      idAlbum: albumToEdit ? albumToEdit.idAlbum : Date.now(),
      titulo,
      canciones: cancionesArr,
      coverURL,
      releaseDate: releaseDate ? new Date(releaseDate).getTime() : Date.now(),
      songImages: songImages.slice(0, cancionesArr.length),
      songCollaborators: songCollaborators.slice(0, cancionesArr.length),
    };

    onSave(newAlbum);
  };

  return (
    <div className="album-form">
      <form onSubmit={handleSubmit}>
        <h3>{albumToEdit ? 'Editar Álbum' : 'Nuevo Álbum'}</h3>

        <div className="form-group">
          <label>Título:</label>
          <input 
            type="text"
            value={titulo} 
            onChange={e => setTitulo(e.target.value)} 
            required 
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Canciones (separadas por coma):</label>
          <input 
            type="text"
            value={canciones} 
            onChange={e => {
              setCanciones(e.target.value);
              // Ajustar arrays de imágenes y colaboradores al número de canciones
              const arr = e.target.value
                .split(',')
                .map(c => c.trim())
                .filter(c => c.length > 0);
              setSongImages(prev => prev.slice(0, arr.length));
              setSongCollaborators(prev => prev.slice(0, arr.length));
            }} 
            placeholder="Canción 1, Canción 2, ..." 
            className="form-input"
          />
        </div>

        {/* Inputs dinámicos para imagen y colaborador por canción */}
        {canciones
          .split(',')
          .map(c => c.trim())
          .filter(c => c.length > 0)
          .map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, background: '#f7f7f7', borderRadius: 6, padding: 8 }}>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                id={`song-img-input-${i}`}
                onChange={e => handleSongImageChange(i, e.target.files?.[0] || null)}
              />
              <label htmlFor={`song-img-input-${i}`} style={{ cursor: 'pointer' }}>
                <img
                  src={songImages[i] ? songImages[i] : 'https://via.placeholder.com/40x40?text=+'}
                  alt=""
                  style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, background: '#eee' }}
                />
              </label>
              <span style={{ flex: 1, fontWeight: 500 }}>{c}</span>
              <input
                type="text"
                placeholder="Colaborador/Cantante"
                style={{ border: '1px solid #ccc', borderRadius: 4, padding: '0.2rem 0.5rem', fontSize: '1rem', minWidth: 120 }}
                value={songCollaborators[i] || ''}
                onChange={e => handleSongCollaboratorChange(i, e.target.value)}
              />
            </div>
          ))}

        <div className="form-group">
          <label>Fecha de lanzamiento:</label>
          <input 
            type="date" 
            value={releaseDate} 
            onChange={e => setReleaseDate(e.target.value)} 
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Portada (imagen jpg/png):</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            className="form-input file-input"
          />
          {coverURL && (
            <div className="image-preview">
              <img src={coverURL} alt="Portada" />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {albumToEdit ? 'Guardar Cambios' : 'Agregar Álbum'}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AlbumForm;
