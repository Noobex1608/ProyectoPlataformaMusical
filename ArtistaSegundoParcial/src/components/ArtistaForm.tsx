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
    <form className="artista-form" onSubmit={handleSubmit}>
      <h2>{artistaInicial ? 'Editar Artista' : 'Crear Artista'}</h2>

      <div className="form-grid">
        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            value={artista.nombre}
            onChange={e => setArtista({ ...artista, nombre: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Género</label>
          <input
            type="text"
            value={artista.genero}
            onChange={e => setArtista({ ...artista, genero: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>País</label>
          <input
            type="text"
            value={artista.pais}
            onChange={e => setArtista({ ...artista, pais: e.target.value })}
            required
          />
        </div>

        <div className="form-group full-width">
          <label>Descripción</label>
          <textarea
            value={artista.descripcion}
            onChange={e => setArtista({ ...artista, descripcion: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Imagen del Artista</label>
          <input type="file" accept="image/*" onChange={handleImagen} required={!artistaInicial} />
        </div>
      </div>

      <div className="form-buttons">
        <button type="submit" className="btn">
          {artistaInicial ? 'Guardar Cambios' : 'Agregar Artista'}
        </button>
        <button type="button" className="btn-cancel" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default ArtistaForm;
