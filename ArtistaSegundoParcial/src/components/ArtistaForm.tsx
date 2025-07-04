import { useState } from 'react';
import type { Artista } from '../types/Artista';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  onGuardar: (artista: Artista) => void;
  artistaInicial?: Artista;
  onCancelar: () => void;
}

const ArtistaForm = ({ onGuardar, artistaInicial, onCancelar }: Props) => {
  const [artista, setArtista] = useState<Artista>(
    artistaInicial || {
      id: '',
      nombre: '',
      genero: '',
      pais: '',
      descripcion: '',
      imagen: '',
      tokenVerificacion: '',
    }
  );

  const handleImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setArtista(prev => ({ ...prev, imagen: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar({
      ...artista,
      id: artista.id || uuidv4(),
      tokenVerificacion: artista.tokenVerificacion || '', // se mantiene internamente
    });
    setArtista({
      id: '',
      nombre: '',
      genero: '',
      pais: '',
      descripcion: '',
      imagen: '',
      tokenVerificacion: '',
    });
  };

  return (
    <div className="artista-form">
      <h3>{artistaInicial ? '✏️ Editar Perfil de Artista' : '🎨 Crear Perfil de Artista'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre artístico:</label>
          <input
            type="text"
            value={artista.nombre}
            onChange={e => setArtista({ ...artista, nombre: e.target.value })}
            required
            className="form-input"
            placeholder="Tu nombre artístico"
          />
        </div>

        <div className="form-group">
          <label>Género musical:</label>
          <input
            type="text"
            value={artista.genero}
            onChange={e => setArtista({ ...artista, genero: e.target.value })}
            required
            className="form-input"
            placeholder="Rock, Pop, Jazz, etc."
          />
        </div>

        <div className="form-group">
          <label>País de origen:</label>
          <input
            type="text"
            value={artista.pais}
            onChange={e => setArtista({ ...artista, pais: e.target.value })}
            required
            className="form-input"
            placeholder="Tu país"
          />
        </div>

        <div className="form-group">
          <label>Descripción:</label>
          <textarea
            value={artista.descripcion}
            onChange={e => setArtista({ ...artista, descripcion: e.target.value })}
            required
            className="form-input"
            rows={4}
            placeholder="Cuéntanos sobre tu música y tu historia..."
          />
        </div>

        <div className="form-group">
          <label>Foto de perfil:</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImagen} 
            required={!artistaInicial}
            className="form-input file-input"
          />
          {artista.imagen && (
            <div className="image-preview">
              <img src={artista.imagen} alt="Preview" />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {artistaInicial ? '💾 Guardar Cambios' : '🚀 Crear Perfil'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancelar}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArtistaForm;
