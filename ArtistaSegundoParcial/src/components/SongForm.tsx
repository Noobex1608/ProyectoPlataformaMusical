import React, { useState, useEffect, type FormEvent } from 'react';
import type { song as Song } from '../types/cancion';
import { useCanciones } from '../hooks/useCanciones';
import { useArtistaActual } from '../hooks/useArtistaActual';

interface Props {
  onSave: (song: Song) => Promise<void>;
  onCancel: () => void;
  songToEdit?: Song;
  disabled?: boolean;
}

const SongForm: React.FC<Props> = ({ onSave, onCancel, songToEdit, disabled = false }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [duration, setDuration] = useState(0);
  const [genre, setGenre] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string>('');
  const [audioPreview, setAudioPreview] = useState<string>('');
  const [lyrics, setLyrics] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Hook para subir archivos
  const { subirAudio, subirImagen } = useCanciones();
  
  // Hook para obtener datos del artista actual
  const { artista } = useArtistaActual();

  useEffect(() => {
    if (songToEdit) {
      setTitle(songToEdit.title);
      setArtist(songToEdit.artist);
      setAlbum(songToEdit.album);
      setDuration(songToEdit.duration);
      setGenre(songToEdit.genre);
      setReleaseDate(songToEdit.releaseDate ? songToEdit.releaseDate.toISOString().slice(0, 10) : '');
      setImagenPreview(songToEdit.imagenUrl || '');
      setAudioPreview(songToEdit.audioData || '');
      setLyrics(songToEdit.lyrics || '');
    } else if (artista?.nombre_artistico) {
      // Auto-rellenar el campo artista con el nombre del artista autenticado
      setArtist(artista.nombre_artistico);
    }
  }, [songToEdit, artista]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImagenFile(file);
    
    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => setImagenPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setAudioFile(file);
    
    // Crear preview y obtener duración
    const reader = new FileReader();
    reader.onloadend = () => {
      setAudioPreview(reader.result as string);
      
      // Intentar obtener duración del audio
      const audio = new Audio(reader.result as string);
      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(Math.round(audio.duration));
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Asegurar que tenemos el nombre del artista
    const artistName = artist || artista?.nombre_artistico;
    
    if (!title || !artistName) {
      alert('Título y artista son obligatorios');
      return;
    }

    setUploading(true);
    setUploadProgress('Preparando...');

    try {
      let imagenUrl = songToEdit?.imagenUrl || '';
      let audioData = songToEdit?.audioData || '';

      // Subir imagen si hay una nueva
      if (imagenFile) {
        setUploadProgress('Subiendo imagen...');
        imagenUrl = await subirImagen(imagenFile);
      }

      // Subir audio si hay uno nuevo
      if (audioFile) {
        setUploadProgress('Subiendo audio...');
        audioData = await subirAudio(audioFile);
      }

      setUploadProgress('Guardando canción...');

      const now = new Date();
      const newSong: Song = {
        id: songToEdit ? songToEdit.id : Date.now(),
        title,
        artist: artistName, // Usar el nombre del artista correcto
        album,
        duration,
        genre,
        releaseDate: releaseDate ? new Date(releaseDate) : undefined,
        createdAt: songToEdit ? songToEdit.createdAt : now,
        updatedAt: now,
        imagenUrl,
        audioData,
        lyrics: lyrics || undefined,
      };

      await onSave(newSong);
      setUploadProgress('¡Completado!');
      
    } catch (error: any) {
      console.error('Error guardando canción:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const isFormDisabled = disabled || uploading;

  return (
    <div className="album-form">
      <form onSubmit={handleSubmit}>
        <h3>{songToEdit ? 'Editar Canción' : 'Nueva Canción'}</h3>

        {uploading && (
          <div style={{ 
            background: '#e3f2fd', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            textAlign: 'center',
            color: '#1976d2'
          }}>
            🔄 {uploadProgress}
          </div>
        )}

        <div className="form-group">
          <label>Título: *</label>
          <input 
            type="text"
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required 
            disabled={isFormDisabled}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Artista: *</label>
          <input 
            type="text"
            value={artist || (artista?.nombre_artistico ? `${artista.nombre_artistico} (auto-detectado)` : 'Cargando...')} 
            readOnly
            disabled={isFormDisabled}
            className="form-input"
            style={{ 
              backgroundColor: '#f8f9fa', 
              cursor: 'not-allowed',
              color: '#6c757d'
            }}
            title="Este campo se rellena automáticamente con tu nombre de artista"
          />
          <small style={{ color: '#6c757d', fontSize: '0.8em' }}>
            Se detecta automáticamente tu nombre de artista
          </small>
        </div>

        <div className="form-group">
          <label>Álbum:</label>
          <input 
            type="text"
            value={album} 
            onChange={e => setAlbum(e.target.value)} 
            disabled={isFormDisabled}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Duración (segundos):</label>
          <input
            type="number"
            min={0}
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            disabled={isFormDisabled}
            className="form-input"
          />
          <small style={{ color: '#666' }}>
            Se detectará automáticamente si subes un archivo de audio
          </small>
        </div>

        <div className="form-group">
          <label>Género:</label>
          <input 
            type="text"
            value={genre} 
            onChange={e => setGenre(e.target.value)} 
            disabled={isFormDisabled}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Fecha de Lanzamiento:</label>
          <input 
            type="date" 
            value={releaseDate} 
            onChange={e => setReleaseDate(e.target.value)} 
            disabled={isFormDisabled}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Imagen de la canción:</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            disabled={isFormDisabled}
            className="form-input file-input"
          />
          {imagenPreview && (
            <div className="image-preview">
              <img src={imagenPreview} alt="Preview" style={{ maxWidth: '200px', marginTop: '10px' }} />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Archivo de audio: *</label>
          <input 
            type="file" 
            accept="audio/*" 
            onChange={handleAudioChange} 
            disabled={isFormDisabled}
            className="form-input file-input"
          />
          {audioPreview && (
            <div style={{ marginTop: '1rem' }}>
              <audio controls style={{ width: '100%' }}>
                <source src={audioPreview} />
                Tu navegador no soporta audio.
              </audio>
            </div>
          )}
          <small style={{ color: '#666' }}>
            Formatos soportados: MP3, WAV, OGG, M4A, AAC, FLAC
          </small>
        </div>

        <div className="form-group">
          <label>Letra de la canción:</label>
          <textarea 
            value={lyrics} 
            onChange={e => setLyrics(e.target.value)} 
            disabled={isFormDisabled}
            className="form-input"
            rows={6}
            placeholder="Escribe aquí la letra de la canción..."
          />
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={isFormDisabled}
            className="btn btn-primary"
          >
            {uploading ? '⏳ Guardando...' : (songToEdit ? 'Guardar Cambios' : 'Agregar Canción')}
          </button>
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={uploading}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default SongForm;
